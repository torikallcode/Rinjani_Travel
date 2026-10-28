package handlers

import (
	"net/http"
	"rinjani-travel-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PackageHandler struct {
	db *gorm.DB
}

func NewPackageHandler(db *gorm.DB) *PackageHandler {
	return &PackageHandler{db: db}
}

// GetAllPackages - GET /api/v1/packages
func (h *PackageHandler) GetAllPackages(c *gin.Context) {
	var packages []models.Package

	if err := h.db.Where("status = ?", "published").Find(&packages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch packages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   packages,
		"count":  len(packages),
	})
}

// GetPackageBySlug - GET /api/v1/packages/:slug
func (h *PackageHandler) GetPackageBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var pkg models.Package

	if err := h.db.Where("slug = ? AND status = ?", slug, "published").First(&pkg).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch package"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   pkg,
	})
}

// CreatePackage - POST /api/v1/packages (admin only)
func (h *PackageHandler) CreatePackage(c *gin.Context) {
	var pkg models.Package

	if err := c.ShouldBindJSON(&pkg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&pkg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create package"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data":   pkg,
	})
}

// UpdatePackage - PUT /api/v1/packages/:id (admin only)
func (h *PackageHandler) UpdatePackage(c *gin.Context) {
	id := c.Param("id")
	var pkg models.Package

	if err := h.db.First(&pkg, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch package"})
		return
	}

	if err := c.ShouldBindJSON(&pkg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Save(&pkg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update package"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   pkg,
	})
}

// DeletePackage - DELETE /api/v1/packages/:id (admin only)
func (h *PackageHandler) DeletePackage(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Package{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete package"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"message": "Package deleted successfully",
	})
}
