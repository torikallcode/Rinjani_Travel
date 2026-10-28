package routes

import (
	"rinjani-travel-backend/internal/handlers"
	"rinjani-travel-backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	apiV1 := router.Group("/api/v1")

	// Package routes
	packageHandler := handlers.NewPackageHandler(db)
	
	// Public routes
	apiV1.GET("/packages", packageHandler.GetAllPackages)
	apiV1.GET("/packages/:slug", packageHandler.GetPackageBySlug)
	
	// Admin routes (protected)
	admin := apiV1.Group("")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.AdminMiddleware())
	admin.POST("/packages", packageHandler.CreatePackage)
	admin.PUT("/packages/:id", packageHandler.UpdatePackage)
	admin.DELETE("/packages/:id", packageHandler.DeletePackage)
}
