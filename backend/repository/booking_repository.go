package repository

import (
	"database/sql"
	"github.com/torikallcode/rinjani-travel/models"
)

type BookingRepository struct {
	db *sql.DB
}

func NewBookingRepository(db *sql.DB) *BookingRepository {
	return &BookingRepository{db: db}
}

func (r *BookingRepository) CreateBooking(booking *models.CreateBookingRequest) error {
	query := `
		INSERT INTO bookings (user_id, travel_id, total_price) 
		VALUES ($1, $2, $3)
	`
	_, err := r.db.Exec(query, booking.UserID, booking.TravelID, booking.TotalPrice)
	return err
}

func (r *BookingRepository) GetUserBookings(userID int) ([]models.Booking, error) {
	query := `
		SELECT id, user_id, travel_id, booking_date, total_price 
		FROM bookings WHERE user_id = $1
	`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []models.Booking
	for rows.Next() {
		var b models.Booking
		err := rows.Scan(&b.ID, &b.UserID, &b.TravelID, &b.BookingDate, &b.TotalPrice)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	return bookings, nil
}