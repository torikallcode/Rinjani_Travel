package migrations

import (
	"log"
	"rinjani-travel-backend/internal/models"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	log.Println("Running database migrations...")

	if err := db.AutoMigrate(
		&models.User{},
		&models.Package{},
		&models.PackageDeparture{},
		&models.Booking{},
		&models.Payment{},
	); err != nil {
		log.Fatalf("Migration failed: %v", err)
		return err
	}

	log.Println("✓ Database migrations completed successfully")
	return nil
}
