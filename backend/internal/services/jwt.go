package services

import (
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
)

func generateToken(user models.User) (string, error) {
	now := time.Now()
	claims := middleware.Claims{
		UserID: user.ID,
		Role:   user.Role,
		Email:  user.Email,
		Name:   user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.Email,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(config.App.JWTExpiry)),
			Issuer:    "rinjani-travel",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.App.JWTSecret))
}
