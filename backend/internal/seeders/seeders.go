package seeders

import (
	"log"
	"rinjani-travel-backend/internal/models"

	"gorm.io/gorm"
)

func SeedPackages(db *gorm.DB) error {
	log.Println("Seeding packages...")

	// Check if packages already exist
	var count int64
	db.Model(&models.Package{}).Count(&count)
	if count > 0 {
		log.Println("Packages already seeded, skipping...")
		return nil
	}

	packages := []models.Package{
		{
			Slug:        "mount-rinjani-trekking-4d3n-senaru",
			Title:       "Mount Rinjani Trekking 4D3N via Senaru",
			Category:    "trekking",
			Description: "Trekking Rinjani 4 days 3 nights via Senaru crater rim-lake-summit",
			Image:       "img/Rinjani.jpg",
			Difficulty:  "hard",
			Duration:    4,
			Days:        4,
			Rating:      4.8,
			BasePrice:   2600000,
			Currency:    "IDR",
			Status:      "published",
		},
		{
			Slug:        "rinjani-trekking-4d3n-sembalun",
			Title:       "Rinjani Trekking 4D3N via Sembalun",
			Category:    "trekking",
			Description: "Trekking Rinjani 4 days 3 nights via Sembalun crater rim-lake-summit",
			Image:       "img/Rinjani.jpg",
			Difficulty:  "hard",
			Duration:    4,
			Days:        4,
			Rating:      4.9,
			BasePrice:   2600000,
			Currency:    "IDR",
			Status:      "published",
		},
		{
			Slug:        "rinjani-trekking-3d2n-sembalun",
			Title:       "Rinjani Trekking 3D2N via Sembalun",
			Category:    "trekking",
			Description: "Trekking Rinjani 3 days 2 nights via Sembalun to crater rim",
			Image:       "img/Rinjani.jpg",
			Difficulty:  "moderate",
			Duration:    3,
			Days:        3,
			Rating:      4.7,
			BasePrice:   2100000,
			Currency:    "IDR",
			Status:      "published",
		},
		{
			Slug:        "mount-rinjani-summit-trekking-4d3n",
			Title:       "Mount Rinjani Summit Trekking 4D3N",
			Category:    "trekking",
			Description: "Complete Rinjani summit trekking experience 4 days 3 nights",
			Image:       "img/Rinjani.jpg",
			Difficulty:  "hard",
			Duration:    4,
			Days:        4,
			Rating:      5.0,
			BasePrice:   2600000,
			Currency:    "IDR",
			Status:      "published",
		},
	}

	for _, pkg := range packages {
		if err := db.Create(&pkg).Error; err != nil {
			log.Printf("Failed to seed package %s: %v", pkg.Title, err)
			return err
		}
	}

	log.Println("✓ Packages seeded successfully")
	return nil
}

func SeedUsers(db *gorm.DB) error {
	log.Println("Seeding users...")

	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		log.Println("Users already seeded, skipping...")
		return nil
	}

	// Create admin user (password: admin123)
	users := []models.User{
		{
			Name:         "Super Admin",
			Email:        "admin@rinjanitravel.com",
			Phone:        "6281234567890",
			PasswordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: password
			Role:         "super_admin",
		},
		{
			Name:         "Test Customer",
			Email:        "customer@test.com",
			Phone:        "6281234567891",
			PasswordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: password
			Role:         "customer",
		},
	}

	for _, user := range users {
		if err := db.Create(&user).Error; err != nil {
			log.Printf("Failed to seed user %s: %v", user.Email, err)
			return err
		}
	}

	log.Println("✓ Users seeded successfully")
	return nil
}

func RunAllSeeders(db *gorm.DB) error {
	if err := SeedUsers(db); err != nil {
		return err
	}
	if err := SeedPackages(db); err != nil {
		return err
	}
	return nil
}
