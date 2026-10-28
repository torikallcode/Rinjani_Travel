package handlers

import (
	"net/http"
	"strconv"

	"rinjani-travel-backend/internal/services"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DepartureHandler struct {
	db      *gorm.DB
	service *services.PackageService
}

func NewDepartureHandler(db *gorm.DB) *DepartureHandler {
	return &DepartureHandler{db: db, service: services.NewPackageService(db)}
}

func (h *DepartureHandler) List(c *gin.Context) {
	packageID := uint(utils.QueryInt(c, "package_id", 0))
	items, err := h.service.AdminDepartures(packageID)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"items": items, "total": len(items)})
}

func (h *DepartureHandler) Create(c *gin.Context) {
	var input services.DepartureInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	dep, err := h.service.CreateDeparture(input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "departure.create", "departure", strconv.Itoa(int(dep.ID)), nil, dep)
	utils.SuccessResponse(c, http.StatusCreated, "Jadwal keberangkatan dibuat.", dep)
}

func (h *DepartureHandler) Update(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var input services.DepartureInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	dep, err := h.service.UpdateDeparture(id, input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "departure.update", "departure", strconv.Itoa(int(id)), nil, dep)
	utils.SuccessResponse(c, http.StatusOK, "Jadwal keberangkatan diperbarui.", dep)
}

func (h *DepartureHandler) Delete(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	if err := h.service.DeleteDeparture(id); err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "departure.delete", "departure", strconv.Itoa(int(id)), nil, nil)
	utils.SuccessResponse(c, http.StatusOK, "Jadwal keberangkatan dihapus.", nil)
}
