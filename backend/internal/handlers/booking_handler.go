package handlers

import (
	"net/http"
	"strings"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/services"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BookingHandler struct {
	db      *gorm.DB
	service *services.BookingService
}

func NewBookingHandler(db *gorm.DB) *BookingHandler {
	return &BookingHandler{db: db, service: services.NewBookingService(db, services.NewEmailService(db))}
}

func (h *BookingHandler) Quote(c *gin.Context) {
	var input services.QuoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	quote, err := h.service.Quote(input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", quote)
}

func (h *BookingHandler) Create(c *gin.Context) {
	var input services.CreateBookingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	booking, err := h.service.Create(
		middleware.CurrentUserID(c),
		input,
		c.GetHeader("Idempotency-Key"),
	)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Pesanan berhasil dibuat. Selesaikan pembayaran sebelum batas waktu.", booking)
}

func (h *BookingHandler) MyBookings(c *gin.Context) {
	page, pageSize, _ := utils.Pagination(c)
	items, total, err := h.service.ListUserBookings(middleware.CurrentUserID(c), page, pageSize)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *BookingHandler) MyBooking(c *gin.Context) {
	booking, err := h.service.LoadBookingByCode(c.Param("code"), middleware.CurrentUserID(c), false)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", booking)
}

func (h *BookingHandler) Cancel(c *gin.Context) {
	var input struct {
		Reason string `json:"reason"`
	}
	_ = c.ShouldBindJSON(&input)
	booking, err := h.service.CancelByCustomer(c.Param("code"), middleware.CurrentUserID(c), input.Reason)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Pesanan dibatalkan.", booking)
}

func (h *BookingHandler) RequestCancellation(c *gin.Context) {
	var input struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	booking, err := h.service.RequestCancellation(c.Param("code"), middleware.CurrentUserID(c), input.Reason)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Permintaan pembatalan telah diterima dan akan diproses tim operasional.", booking)
}

func (h *BookingHandler) AddReview(c *gin.Context) {
	var input struct {
		Rating  int    `json:"rating" binding:"required,min=1,max=5"`
		Title   string `json:"title" binding:"max=200"`
		Content string `json:"content" binding:"required,min=10,max=3000"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	review, err := h.service.AddReview(middleware.CurrentUserID(c), c.Param("code"), input.Rating, input.Title, input.Content)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Ulasan dikirim dan menunggu moderasi.", review)
}

func (h *BookingHandler) AdminList(c *gin.Context) {
	page, pageSize, _ := utils.Pagination(c)
	filter := services.AdminBookingsFilter{
		Search:    c.Query("q"),
		Status:    c.Query("status"),
		PackageID: uint(utils.QueryInt(c, "package_id", 0)),
		DateFrom:  c.Query("date_from"),
		DateTo:    c.Query("date_to"),
		Page:      page,
		PageSize:  pageSize,
	}
	items, total, err := h.service.AdminListBookings(filter)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *BookingHandler) AdminGet(c *gin.Context) {
	booking, err := h.service.LoadBookingByCode(c.Param("code"), 0, true)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", booking)
}

func (h *BookingHandler) AdminUpdateStatus(c *gin.Context) {
	var input struct {
		Status string `json:"status" binding:"required"`
		Reason string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	booking, err := h.service.LoadBookingByCode(c.Param("code"), 0, true)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	updated, err := h.service.Transition(booking.ID, input.Status, middleware.CurrentUserName(c), input.Reason, uintPtr(middleware.CurrentUserID(c)))
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "booking.status", "booking", booking.BookingCode, gin.H{"status": booking.Status}, gin.H{"status": input.Status, "reason": input.Reason})
	utils.SuccessResponse(c, http.StatusOK, "Status pesanan diperbarui.", updated)
}

func (h *BookingHandler) AdminUpdateNotes(c *gin.Context) {
	var input struct {
		InternalNotes string `json:"internal_notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Catatan tidak valid.")
		return
	}
	booking, err := h.service.LoadBookingByCode(c.Param("code"), 0, true)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	if err := h.db.Model(&models.Booking{}).Where("id = ?", booking.ID).Update("internal_notes", input.InternalNotes).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "booking.notes", "booking", booking.BookingCode, booking.InternalNotes, input.InternalNotes)
	utils.SuccessResponse(c, http.StatusOK, "Catatan internal disimpan.", nil)
}

func (h *BookingHandler) AdminExport(c *gin.Context) {
	filter := services.AdminBookingsFilter{
		Search:    c.Query("q"),
		Status:    c.Query("status"),
		PackageID: uint(utils.QueryInt(c, "package_id", 0)),
		DateFrom:  c.Query("date_from"),
		DateTo:    c.Query("date_to"),
	}
	rows, err := h.service.ExportBookingsCSV(filter)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "booking.export", "booking", "csv", nil, gin.H{"rows": len(rows)})
	writeCSV(c, "rinjani-bookings-"+strings.ReplaceAll(utils.Slugify(c.Query("date_from")), "-", "")+".csv", rows)
}

func (h *BookingHandler) AdminResend(c *gin.Context) {
	booking, err := h.service.LoadBookingByCode(c.Param("code"), 0, true)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	kind := c.Query("type")
	if kind == "" {
		kind = "booking_created"
	}
	email := services.NewEmailService(h.db)
	if err := email.SendBookingNotification(booking, kind); err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "booking.resend", "booking", booking.BookingCode, nil, gin.H{"type": kind})
	utils.SuccessResponse(c, http.StatusOK, "Notifikasi dikirim ulang.", nil)
}

func (h *BookingHandler) Voucher(c *gin.Context) {
	booking, err := h.service.LoadBookingByCode(c.Param("code"), middleware.CurrentUserID(c), false)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"booking":        booking,
		"business_name":  config.App.BusinessName,
		"invoice_number": booking.BookingCode,
		"issued_at":      booking.CreatedAt,
	})
}

func uintPtr(value uint) *uint {
	if value == 0 {
		return nil
	}
	return &value
}
