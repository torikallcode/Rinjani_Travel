package config

import (
	"log"
	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/routes"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func InitRouter(db *gorm.DB) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORSMiddleware())

	// Health check endpoint
	router.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"message":   "Rinjani Travel API is running",
			"timestamp": gin.H{"time": c.Request.Header.Get("Date")},
		})
	})

	// Setup API routes
	routes.SetupRoutes(router, db)

	log.Println("✓ Router initialized")
	return router
}
