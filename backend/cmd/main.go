package main

import (
	"log"
	"os"
	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/migrations"
	"rinjani-travel-backend/internal/seeders"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize database
	db := config.InitDatabase()

	// Run migrations
	if err := migrations.AutoMigrate(db); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	// Run seeders
	if err := seeders.RunAllSeeders(db); err != nil {
		log.Fatalf("Seeding failed: %v", err)
	}

	// Initialize router
	router := config.InitRouter(db)

	// Get server port from env
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8000"
	}

	env := os.Getenv("SERVER_ENV")
	if env == "" {
		env = "development"
	}

	log.Printf("🚀 Server running on port %s", port)
	log.Printf("📍 Environment: %s", env)

	// Start server
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	// Close database connection on shutdown
	sqlDB, _ := db.DB()
	defer sqlDB.Close()
}
