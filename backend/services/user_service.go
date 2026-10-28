package services

import (
	"rinjani-travel-backend/models"
	"rinjani-travel-backend/repository"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Register(req *models.RegisterRequest) error {
	return s.repo.Register(req)
}

func (s *UserService) Login(email, password string) (*models.User, error) {
	return s.repo.Login(email, password)
}