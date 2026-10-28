package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ContentHandler struct {
	db *gorm.DB
}

func NewContentHandler(db *gorm.DB) *ContentHandler {
	return &ContentHandler{db: db}
}

func (h *ContentHandler) Page(c *gin.Context) {
	var page models.ContentPage
	if err := h.db.Where("slug = ? AND status = ?", c.Param("slug"), "published").First(&page).Error; err != nil {
		utils.RespondError(c, utils.NotFound("Halaman tidak ditemukan."))
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", page)
}

func (h *ContentHandler) Pages(c *gin.Context) {
	var pages []models.ContentPage
	if err := h.db.Order("title ASC").Find(&pages).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"items": pages, "total": len(pages)})
}

func (h *ContentHandler) CreatePage(c *gin.Context) {
	var input models.ContentPage
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Data halaman tidak valid.")
		return
	}
	input.Slug = utils.Slugify(input.Slug)
	if input.Slug == "" {
		input.Slug = utils.Slugify(input.Title)
	}
	if input.Slug == "" || input.Title == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Judul dan slug wajib diisi.")
		return
	}
	if input.Status == "" {
		input.Status = "published"
	}
	var count int64
	h.db.Model(&models.ContentPage{}).Where("slug = ?", input.Slug).Count(&count)
	if count > 0 {
		utils.ErrorResponse(c, http.StatusConflict, "Slug halaman sudah digunakan.")
		return
	}
	if err := h.db.Create(&input).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "content.create", "content_page", input.Slug, nil, input)
	utils.SuccessResponse(c, http.StatusCreated, "Halaman dibuat.", input)
}

func (h *ContentHandler) UpdatePage(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var page models.ContentPage
	if err := h.db.First(&page, id).Error; err != nil {
		utils.RespondError(c, utils.NotFound("Halaman tidak ditemukan."))
		return
	}
	var input models.ContentPage
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Data halaman tidak valid.")
		return
	}
	slug := utils.Slugify(input.Slug)
	if slug == "" {
		slug = page.Slug
	}
	if err := h.db.Model(&page).Updates(map[string]interface{}{
		"slug": slug, "title": input.Title, "content": input.Content,
		"meta_title": input.MetaTitle, "meta_description": input.MetaDescription,
		"status": input.Status,
	}).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "content.update", "content_page", slug, page, input)
	utils.SuccessResponse(c, http.StatusOK, "Halaman diperbarui.", page)
}

func (h *ContentHandler) DeletePage(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var page models.ContentPage
	if err := h.db.First(&page, id).Error; err != nil {
		utils.RespondError(c, utils.NotFound("Halaman tidak ditemukan."))
		return
	}
	if err := h.db.Delete(&page).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "content.delete", "content_page", page.Slug, page, nil)
	utils.SuccessResponse(c, http.StatusOK, "Halaman dihapus.", nil)
}

func (h *ContentHandler) FAQs(c *gin.Context) {
	var faqs []models.FAQ
	query := h.db.Order("sort_order ASC, id ASC")
	if c.Query("all") != "true" {
		query = query.Where("published = ?", true)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if err := query.Find(&faqs).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"items": faqs, "total": len(faqs)})
}

func (h *ContentHandler) CreateFAQ(c *gin.Context) {
	var input models.FAQ
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Data FAQ tidak valid.")
		return
	}
	if strings.TrimSpace(input.Question) == "" || strings.TrimSpace(input.Answer) == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Pertanyaan dan jawaban wajib diisi.")
		return
	}
	if err := h.db.Create(&input).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "faq.create", "faq", strconv.Itoa(int(input.ID)), nil, input)
	utils.SuccessResponse(c, http.StatusCreated, "FAQ dibuat.", input)
}

func (h *ContentHandler) UpdateFAQ(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var faq models.FAQ
	if err := h.db.First(&faq, id).Error; err != nil {
		utils.RespondError(c, utils.NotFound("FAQ tidak ditemukan."))
		return
	}
	var input models.FAQ
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Data FAQ tidak valid.")
		return
	}
	if err := h.db.Model(&faq).Updates(map[string]interface{}{
		"question": input.Question, "answer": input.Answer, "category": input.Category,
		"sort_order": input.SortOrder, "published": input.Published,
	}).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "faq.update", "faq", strconv.Itoa(int(id)), faq, input)
	utils.SuccessResponse(c, http.StatusOK, "FAQ diperbarui.", faq)
}

func (h *ContentHandler) DeleteFAQ(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	if err := h.db.Delete(&models.FAQ{}, id).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "faq.delete", "faq", strconv.Itoa(int(id)), nil, nil)
	utils.SuccessResponse(c, http.StatusOK, "FAQ dihapus.", nil)
}
