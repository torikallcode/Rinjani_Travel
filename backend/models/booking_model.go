package models

import "time"

type Booking struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	TravelID    int       `json:"travel_id"`
	BookingDate time.Time `json:"booking_date"`
	TotalPrice  float64   `json:"total_price"`
}

type CreateBookingRequest struct {
	UserID    int     `json:"user_id"`
	TravelID  int     `json:"travel_id"`
	Quantity  int     `json:"quantity"`
	TotalPrice float64 `json:"total_price"`
}