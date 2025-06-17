package services

import (
	"github.com/torikallcode/rinjani-travel/models"
	"github.com/torikallcode/rinjani-travel/repository"
)

type TravelService struct {
	repo *repository.TravelRepository
}

func NewTravelService(repo *repository.TravelRepository) *TravelService {
	return &TravelService{repo: repo}
}

func (s *TravelService) GetAllTravels() ([]models.Travel, error) {
	return s.repo.GetAllTravels()
}

func (s *TravelService) CreateTravel(travel *models.CreateTravelRequest) error {
	return s.repo.CreateTravel(travel)
}