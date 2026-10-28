package handlers

import (
	"net/http"
	"strconv"

	"rinjani-travel-backend/internal/services"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PackageHandler struct {
	db      *gorm.DB
	service *services.PackageService
}

func NewPackageHandler(db *gorm.DB) *PackageHandler {
	return &PackageHandler{db: db, service: services.NewPackageService(db)}
}

func (h *PackageHandler) List(c *gin.Context) {
	page, pageSize, _ := utils.Pagination(c)
	filter := services.PackageFilter{
		Search:         c.Query("q"),
		Category:       c.Query("category"),
		Difficulty:     c.Query("difficulty"),
		MinPrice:       utils.QueryInt64(c, "min_price", 0),
		MaxPrice:       utils.QueryInt64(c, "max_price", 0),
		Duration:       utils.QueryInt(c, "duration", 0),
		DeparturePoint: c.Query("departure_point"),
		Date:           c.Query("date"),
		Featured:       c.Query("featured") == "true",
		Sort:           c.Query("sort"),
		Page:           page,
		PageSize:       pageSize,
	}
	items, total, err := h.service.List(filter)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *PackageHandler) Detail(c *gin.Context) {
	detail, err := h.service.Detail(c.Param("slug"))
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", detail)
}

func (h *PackageHandler) Departure(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	dep, pkg, err := h.service.Departure(id)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	price := pkg.BasePrice
	if dep.PriceOverride != nil && *dep.PriceOverride > 0 {
		price = *dep.PriceOverride
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"departure": dep,
		"package":   pkg,
		"price":     price,
		"seats_left": dep.SeatsLeft(),
	})
}

// AdminList - GET /admin/packages
func (h *PackageHandler) AdminList(c *gin.Context) {
	page, pageSize, _ := utils.Pagination(c)
	items, total, err := h.service.AdminList(services.PackageFilter{
		Search:   c.Query("q"),
		Category: c.Query("category"),
		Status:   c.Query("status"),
		Page:     page,
		PageSize: pageSize,
	})
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *PackageHandler) AdminGet(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	pkg, err := h.service.AdminGet(id)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", pkg)
}

func (h *PackageHandler) Create(c *gin.Context) {
	var input services.PackageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	pkg, err := h.service.Create(input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "package.create", "package", strconv.Itoa(int(pkg.ID)), nil, pkg)
	utils.SuccessResponse(c, http.StatusCreated, "Paket berhasil dibuat.", pkg)
}

func (h *PackageHandler) Update(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	before, _ := h.service.AdminGet(id)
	var input services.PackageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}

	pkg, err := h.service.Update(id, input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "package.update", "package", strconv.Itoa(int(id)), before, pkg)
	utils.SuccessResponse(c, http.StatusOK, "Paket berhasil diperbarui.", pkg)
}

func (h *PackageHandler) Delete(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	before, _ := h.service.AdminGet(id)
	if err := h.service.Delete(id); err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "package.delete", "package", strconv.Itoa(int(id)), before, nil)
	utils.SuccessResponse(c, http.StatusOK, "Paket berhasil dihapus.", nil)
}
