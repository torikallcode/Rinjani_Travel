package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	Name              string         `gorm:"size:100;not null" json:"name"`
	Email             string         `gorm:"size:100;not null;unique" json:"email"`
	Phone             string         `gorm:"size:20;not null" json:"phone"`
	PasswordHash      string         `gorm:"size:255;not null" json:"-"`
	Role              string         `gorm:"size:20;default:'customer'" json:"role"`
	EmailVerifiedAt   *time.Time     `json:"email_verified_at"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

type Package struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Slug          string         `gorm:"size:200;not null;unique" json:"slug"`
	Title         string         `gorm:"size:200;not null" json:"title"`
	Category      string         `gorm:"size:50;not null" json:"category"` // trekking, tour, adventure
	Description   string         `gorm:"type:text;not null" json:"description"`
	Image         string         `gorm:"type:text" json:"image"`
	Difficulty    string         `gorm:"size:20;not null" json:"difficulty"`
	Duration      int            `json:"duration"`
	Days          int            `json:"days"`
	Rating        float64        `gorm:"type:decimal(3,1);default:0" json:"rating"`
	BasePrice     float64        `gorm:"type:decimal(12,2);not null" json:"base_price"`
	Currency      string         `gorm:"size:3;default:'IDR'" json:"currency"`
	Status        string         `gorm:"size:20;default:'draft'" json:"status"`
	DescLengkap   string         `gorm:"type:text" json:"desc_lengkap"`
	DaySatu       string         `gorm:"type:text" json:"day_satu"`
	DayDua        string         `gorm:"type:text" json:"day_dua"`
	DayTiga       string         `gorm:"type:text" json:"day_tiga"`
	DayEmpat      string         `gorm:"type:text" json:"day_empat"`
	DaySatuLengkap string        `gorm:"type:text" json:"day_satu_lengkap"`
	DayDuaLengkap  string        `gorm:"type:text" json:"day_dua_lengkap"`
	DayTigaLengkap string        `gorm:"type:text" json:"day_tiga_lengkap"`
	DayEmpatLengkap string       `gorm:"type:text" json:"day_empat_lengkap"`
	Include       string         `gorm:"type:text" json:"include"`  // JSON array string
	Exclude       string         `gorm:"type:text" json:"exclude"`  // JSON array string
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type PackageDeparture struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	PackageID     uint           `json:"package_id"`
	Package       Package        `gorm:"foreignKey:PackageID"`
	StartDate     time.Time      `not null json:"start_date"`
	EndDate       time.Time      `not null json:"end_date"`
	Capacity      int            `not null json:"capacity"`
	ReservedCount int            `gorm:"default:0" json:"reserved_count"`
	PriceOverride *float64       `gorm:"type:decimal(12,2)" json:"price_override"`
	Status        string         `gorm:"size:20;default:'open'" json:"status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type Booking struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	BookingCode        string         `gorm:"size:50;not null;unique" json:"booking_code"`
	UserID             uint           `json:"user_id"`
	User               User           `gorm:"foreignKey:UserID"`
	DepartureID        uint           `json:"departure_id"`
	Departure          PackageDeparture `gorm:"foreignKey:DepartureID"`
	Status             string         `gorm:"size:20;default:'draft'" json:"status"`
	Total              float64        `gorm:"type:decimal(12,2);not null" json:"total"`
	NumberOfTravelers  int            `not null json:"number_of_travelers"`
	OrganizerName      string         `gorm:"size:100;not null" json:"organizer_name"`
	OrganizerPhone     string         `gorm:"size:20;not null" json:"organizer_phone"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
}

type Payment struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	BookingID         uint           `json:"booking_id"`
	Booking           Booking        `gorm:"foreignKey:BookingID"`
	Provider          string         `gorm:"size:50;not null" json:"provider"`
	ProviderReference string         `gorm:"size:200" json:"provider_reference"`
	Amount            float64        `gorm:"type:decimal(12,2);not null" json:"amount"`
	Status            string         `gorm:"size:20;default:'pending'" json:"status"`
	PaidAt            *time.Time     `json:"paid_at"`
	CreatedAt         time.Time      `json:"created_at"`
}
