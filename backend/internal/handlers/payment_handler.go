package handlers

import (
	"io"
	"net/http"
	"strconv"

	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/services"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaymentHandler struct {
	db      *gorm.DB
	service *services.PaymentService
}

func NewPaymentHandler(db *gorm.DB, gateway services.PaymentGateway) *PaymentHandler {
	return &PaymentHandler{
		db:      db,
		service: services.NewPaymentService(db, gateway, services.NewEmailService(db)),
	}
}

func (h *PaymentHandler) Create(c *gin.Context) {
	var input struct {
		Method string `json:"method"`
	}
	_ = c.ShouldBindJSON(&input)
	payment, err := h.service.CreatePayment(c.Param("code"), middleware.CurrentUserID(c), false, input.Method)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Instruksi pembayaran dibuat.", gin.H{
		"payment":     payment,
		"payment_url": payment.PaymentURL,
	})
}

func (h *PaymentHandler) List(c *gin.Context) {
	booking, err := services.NewBookingService(h.db, services.NewEmailService(h.db)).
		LoadBookingByCode(c.Param("code"), middleware.CurrentUserID(c), false)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"items": booking.Payments, "total": len(booking.Payments)})
}

func (h *PaymentHandler) AdminList(c *gin.Context) {
	page, pageSize, offset := utils.Pagination(c)
	query := h.db.Model(&struct {
		ID                uint   `json:"id"`
		BookingID         uint   `json:"booking_id"`
		BookingCode       string `json:"booking_code"`
		Provider          string `json:"provider"`
		ProviderReference string `json:"provider_reference"`
		Amount            int64  `json:"amount"`
		Status            string `json:"status"`
		Method            string `json:"method"`
		PaidAt            string `json:"paid_at"`
		CreatedAt         string `json:"created_at"`
	}{}).Table("payments").
		Select("payments.id, payments.booking_id, bookings.booking_code, payments.provider, payments.provider_reference, payments.amount, payments.status, payments.method, payments.paid_at, payments.created_at").
		Joins("LEFT JOIN bookings ON bookings.id = payments.booking_id")
	if status := c.Query("status"); status != "" {
		query = query.Where("payments.status = ?", status)
	}
	if q := c.Query("q"); q != "" {
		like := "%" + q + "%"
		query = query.Where("bookings.booking_code LIKE ? OR payments.provider_reference LIKE ?", like, like)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	var items []map[string]interface{}
	if err := query.Order("payments.created_at DESC").Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *PaymentHandler) AdminManual(c *gin.Context) {
	var input struct {
		Amount int64  `json:"amount"`
		Method string `json:"method"`
		Note   string `json:"note"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Data pembayaran tidak valid.")
		return
	}
	booking, err := services.NewBookingService(h.db, services.NewEmailService(h.db)).
		LoadBookingByCode(c.Param("code"), 0, true)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	if input.Amount <= 0 {
		input.Amount = booking.Total
	}
	if input.Amount != booking.Total {
		utils.ErrorResponse(c, http.StatusBadRequest, "Nominal pembayaran manual harus sama dengan total invoice.")
		return
	}
	// Manual payments are recorded as a paid mock payment and go through the
	// same booking transition, keeping the state machine authoritative.
	gateway := services.NewMockGateway()
	created, err := gateway.CreatePayment(booking)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	created.Amount = input.Amount
	created.Method = "manual"
	created.Status = "pending"
	if input.Note != "" {
		created.RawEventReference = input.Note
	}
	if err := h.db.Create(created).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	// Simulate a verified webhook event for manual reconciliation.
	if _, err := h.service.SimulatePaid(created.ProviderReference); err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "payment.manual", "booking", booking.BookingCode, nil, gin.H{"amount": input.Amount, "method": "manual"})
	utils.SuccessResponse(c, http.StatusCreated, "Pembayaran manual dicatat dan pesanan dikonfirmasi.", created)
}

func (h *PaymentHandler) Refund(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var input struct {
		Reason string `json:"reason"`
	}
	_ = c.ShouldBindJSON(&input)
	payment, err := h.service.Refund(id, middleware.CurrentUserName(c), input.Reason)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "payment.refund", "payment", strconv.Itoa(int(id)), nil, gin.H{"reason": input.Reason})
	utils.SuccessResponse(c, http.StatusOK, "Refund dicatat.", payment)
}

func (h *PaymentHandler) Webhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Tidak dapat membaca payload.")
		return
	}
	signature := c.GetHeader("X-Signature")
	if signature == "" {
		signature = c.GetHeader("X-Callback-Token")
	}
	event, err := h.service.HandleWebhook(c.Param("provider"), payload, signature)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Webhook diproses.", event)
}

func (h *PaymentHandler) Simulate(c *gin.Context) {
	event, err := h.service.SimulatePaid(c.Param("ref"))
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Pembayaran simulasi berhasil diverifikasi.", event)
}

func (h *PaymentHandler) WebhookEvents(c *gin.Context) {
	page, pageSize, offset := utils.Pagination(c)
	query := h.db.Model(&struct{}{}).Table("payment_events")
	if provider := c.Query("provider"); provider != "" {
		query = query.Where("provider = ?", provider)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	var items []map[string]interface{}
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}
