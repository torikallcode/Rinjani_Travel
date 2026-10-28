package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CouponHandler struct {
	db *gorm.DB
}

func NewCouponHandler(db *gorm.DB) *CouponHandler {
	return &CouponHandler{db: db}
}

type CouponInput struct {
	Code        string     `json:"code" binding:"required"`
	Description string     `json:"description"`
	Type        string     `json:"type" binding:"required,oneof=percent fixed"`
	Value       int64      `json:"value" binding:"required,gt=0"`
	MinSpend    int64      `json:"min_spend"`
	MaxDiscount int64      `json:"max_discount"`
	UsageLimit  int        `json:"usage_limit"`
	StartsAt    *time.Time `json:"starts_at"`
	EndsAt      *time.Time `json:"ends_at"`
	Active      bool       `json:"active"`
}

func (h *CouponHandler) List(c *gin.Context) {
	page, pageSize, offset := utils.Pagination(c)
	query := h.db.Model(&models.Coupon{})
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		query = query.Where("code LIKE ?", "%"+strings.ToUpper(q)+"%")
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	var items []models.Coupon
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *CouponHandler) Create(c *gin.Context) {
	var input CouponInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	code := strings.ToUpper(strings.TrimSpace(input.Code))
	var count int64
	h.db.Model(&models.Coupon{}).Where("code = ?", code).Count(&count)
	if count > 0 {
		utils.ErrorResponse(c, http.StatusConflict, "Kode promo sudah ada.")
		return
	}
	coupon := models.Coupon{
		Code: code, Description: input.Description, Type: input.Type, Value: input.Value,
		MinSpend: input.MinSpend, MaxDiscount: input.MaxDiscount, UsageLimit: input.UsageLimit,
		StartsAt: input.StartsAt, EndsAt: input.EndsAt, Active: input.Active,
	}
	if err := h.db.Create(&coupon).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "coupon.create", "coupon", code, nil, coupon)
	utils.SuccessResponse(c, http.StatusCreated, "Kode promo dibuat.", coupon)
}

func (h *CouponHandler) Update(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var coupon models.Coupon
	if err := h.db.First(&coupon, id).Error; err != nil {
		utils.RespondError(c, utils.NotFound("Kode promo tidak ditemukan."))
		return
	}
	var input CouponInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	if err := h.db.Model(&coupon).Updates(map[string]interface{}{
		"code": strings.ToUpper(strings.TrimSpace(input.Code)), "description": input.Description,
		"type": input.Type, "value": input.Value, "min_spend": input.MinSpend,
		"max_discount": input.MaxDiscount, "usage_limit": input.UsageLimit,
		"starts_at": input.StartsAt, "ends_at": input.EndsAt, "active": input.Active,
	}).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "coupon.update", "coupon", coupon.Code, coupon, input)
	utils.SuccessResponse(c, http.StatusOK, "Kode promo diperbarui.", coupon)
}

func (h *CouponHandler) Delete(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var coupon models.Coupon
	if err := h.db.First(&coupon, id).Error; err != nil {
		utils.RespondError(c, utils.NotFound("Kode promo tidak ditemukan."))
		return
	}
	if err := h.db.Delete(&coupon).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "coupon.delete", "coupon", coupon.Code, coupon, nil)
	utils.SuccessResponse(c, http.StatusOK, "Kode promo dihapus.", nil)
}

func (h *CouponHandler) Validate(c *gin.Context) {
	code := strings.ToUpper(strings.TrimSpace(c.Param("code")))
	var coupon models.Coupon
	if err := h.db.Where("code = ?", code).First(&coupon).Error; err != nil {
		utils.RespondError(c, utils.NotFound("Kode promo tidak ditemukan."))
		return
	}
	now := time.Now()
	valid := coupon.Active &&
		(coupon.StartsAt == nil || !now.Before(*coupon.StartsAt)) &&
		(coupon.EndsAt == nil || !now.After(*coupon.EndsAt)) &&
		(coupon.UsageLimit == 0 || coupon.UsedCount < coupon.UsageLimit)
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"coupon": coupon, "valid": valid})
}

var _ = strconv.Itoa
