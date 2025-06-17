package services

import (
	"github.com/torikallcode/rinjani-travel/models"
	"github.com/torikallcode/rinjani-travel/repository"
)

type BookingService struct {
	repo *repository.BookingRepository
}

func NewBookingService(repo *repository.BookingRepository) *BookingService {
	return &BookingService{repo: repo}
}

func (s *BookingService) CreateBooking(booking *models.CreateBookingRequest) error {
	return s.repo.CreateBooking(booking)
}

func (s *BookingService) GetUserBookings(userID int) ([]models.Booking, error) {
	return s.repo.GetUserBookings(userID)
}