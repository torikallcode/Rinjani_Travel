package handlers

import (
	"net/http"
	"strconv"

	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/services"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ReviewHandler struct {
	db      *gorm.DB
	service *services.BookingService
}

func NewReviewHandler(db *gorm.DB) *ReviewHandler {
	return &ReviewHandler{
		db:      db,
		service: services.NewBookingService(db, services.NewEmailService(db)),
	}
}

func (h *ReviewHandler) PublicList(c *gin.Context) {
	page, pageSize, offset := utils.Pagination(c)
	query := h.db.Model(&models.Review{}).Where("status = ?", "published")
	if packageID := c.Query("package_id"); packageID != "" {
		query = query.Where("package_id = ?", packageID)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	var reviews []models.Review
	if err := query.Preload("User").Order("published_at DESC").Offset(offset).Limit(pageSize).Find(&reviews).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	items := make([]gin.H, 0, len(reviews))
	for _, review := range reviews {
		name := "Pelanggan Rinjani"
		if review.User != nil && review.User.Name != "" {
			name = review.User.Name
		}
		items = append(items, gin.H{
			"id": review.ID, "rating": review.Rating, "title": review.Title,
			"content": review.Content, "user_name": name, "created_at": review.CreatedAt,
		})
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *ReviewHandler) AdminList(c *gin.Context) {
	page, pageSize, offset := utils.Pagination(c)
	query := h.db.Model(&models.Review{})
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if packageID := c.Query("package_id"); packageID != "" {
		query = query.Where("package_id = ?", packageID)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	var reviews []models.Review
	if err := query.Preload("User").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&reviews).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	type row struct {
		models.Review
		PackageTitle string `json:"package_title"`
		BookingCode  string `json:"booking_code"`
	}
	rows := make([]row, 0, len(reviews))
	for _, review := range reviews {
		var pkg models.Package
		h.db.Select("title").First(&pkg, review.PackageID)
		var booking models.Booking
		h.db.Select("booking_code").First(&booking, review.BookingID)
		rows = append(rows, row{Review: review, PackageTitle: pkg.Title, BookingCode: booking.BookingCode})
	}
	utils.PaginatedResponse(c, http.StatusOK, rows, total, page, pageSize)
}

func (h *ReviewHandler) Moderate(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var input struct {
		Status   string `json:"status" binding:"required,oneof=published rejected pending"`
		AdminNote string `json:"admin_note"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Status ulasan tidak valid.")
		return
	}
	review, err := h.service.ModerateReview(id, input.Status, input.AdminNote)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "review.moderate", "review", strconv.Itoa(int(id)), nil, gin.H{"status": input.Status})
	utils.SuccessResponse(c, http.StatusOK, "Ulasan diperbarui.", review)
}

type ContactHandler struct {
	db *gorm.DB
}

func NewContactHandler(db *gorm.DB) *ContactHandler {
	return &ContactHandler{db: db}
}

func (h *ContactHandler) Create(c *gin.Context) {
	var input struct {
		Name    string `json:"name" binding:"required,min=2,max=120"`
		Email   string `json:"email" binding:"required,email"`
		Phone   string `json:"phone" binding:"max=30"`
		Subject string `json:"subject" binding:"max=200"`
		Message string `json:"message" binding:"required,min=10,max=3000"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	message := models.ContactMessage{
		Name: input.Name, Email: input.Email, Phone: input.Phone,
		Subject: input.Subject, Message: input.Message, Status: "new",
	}
	if err := h.db.Create(&message).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Pesan Anda sudah kami terima. Tim akan menghubungi Anda segera.", nil)
}

func (h *ContactHandler) List(c *gin.Context) {
	page, pageSize, offset := utils.Pagination(c)
	query := h.db.Model(&models.ContactMessage{})
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	var items []models.ContactMessage
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *ContactHandler) UpdateStatus(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var input struct {
		Status string `json:"status" binding:"required,oneof=new read replied archived"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Status pesan tidak valid.")
		return
	}
	if err := h.db.Model(&models.ContactMessage{}).Where("id = ?", id).Update("status", input.Status).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Status pesan diperbarui.", nil)
}
