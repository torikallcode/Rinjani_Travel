package migrations

import (
	"log"

	"rinjani-travel-backend/internal/models"

	"gorm.io/gorm"
)

// AutoMigrate keeps the schema aligned with the model definitions.
// For production deployments, pair this with a versioned migration review
// before rollout; see backend/docs/RUNBOOK.md.
func AutoMigrate(db *gorm.DB) error {
	log.Println("Running database migrations...")

	if err := db.AutoMigrate(
		&models.User{},
		&models.Package{},
		&models.PackageItinerary{},
		&models.PackageAddon{},
		&models.PackageFAQ{},
		&models.PackageDeparture{},
		&models.Booking{},
		&models.BookingTraveler{},
		&models.BookingItem{},
		&models.BookingStatusHistory{},
		&models.Payment{},
		&models.PaymentEvent{},
		&models.Coupon{},
		&models.Review{},
		&models.Media{},
		&models.AuditLog{},
		&models.ContentPage{},
		&models.FAQ{},
		&models.ContactMessage{},
		&models.Setting{},
		&models.Notification{},
	); err != nil {
		log.Printf("Migration failed: %v", err)
		return err
	}

	// Helpful indexes for the most common admin filters.
	indexes := []string{
		"CREATE INDEX idx_bookings_status_created ON bookings (status, created_at)",
		"CREATE INDEX idx_departures_start_status ON package_departures (start_date, status)",
		"CREATE INDEX idx_reviews_package_status ON reviews (package_id, status)",
	}
	for _, statement := range indexes {
		if err := db.Exec(statement).Error; err != nil {
			// Duplicate index errors are safe to ignore during repeated boots.
			log.Printf("Index notice: %v", err)
		}
	}

	log.Println("✓ Database migrations completed successfully")
	return nil
}
