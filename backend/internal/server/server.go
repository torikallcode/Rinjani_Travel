package server

import (
	"log"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/routes"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// InitRouter builds the HTTP router. It lives outside the config package to
// keep configuration free of middleware dependencies.
func InitRouter(db *gorm.DB) *gin.Engine {
	if config.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.RequestID())
	router.Use(middleware.SecurityHeaders())
	router.Use(middleware.CORS())

	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"meta": gin.H{"status": "error", "message": "Endpoint tidak ditemukan", "code": 404}})
	})

	routes.SetupRoutes(router, db)

	log.Println("✓ Router initialized")
	return router
}
