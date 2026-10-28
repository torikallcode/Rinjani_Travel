package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/migrations"
	"rinjani-travel-backend/internal/seeders"
	"rinjani-travel-backend/internal/server"
	"rinjani-travel-backend/internal/services"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	settings := config.LoadSettings()
	log.Printf("Starting %s in %s mode", settings.BusinessName, settings.Env)

	db := config.InitDatabase()

	if err := migrations.AutoMigrate(db); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	if err := seeders.RunAllSeeders(db); err != nil {
		log.Fatalf("Seeding failed: %v", err)
	}

	router := server.InitRouter(db)
	server := &http.Server{
		Addr:              ":" + settings.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	// Background worker releases quota for expired unpaid bookings.
	stopWorker := make(chan struct{})
	bookingService := services.NewBookingService(db, services.NewEmailService(db))
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if count, err := bookingService.ExpireHolds(); err != nil {
					log.Printf("expiry worker error: %v", err)
				} else if count > 0 {
					log.Printf("expiry worker released %d expired bookings", count)
				}
			case <-stopWorker:
				return
			}
		}
	}()

	go func() {
		log.Printf("🚀 Server running on port %s", settings.Port)
		log.Printf("📍 Environment: %s", settings.Env)
		log.Printf("🔗 API: %s/api/v1", settings.APIBaseURL)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")
	close(stopWorker)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
	}
	sqlDB, _ := db.DB()
	if sqlDB != nil {
		_ = sqlDB.Close()
	}
	log.Println("Server stopped")
}
