package repository

import (
	"database/sql"
	"github.com/torikallcode/rinjani-travel/models"
)

type TravelRepository struct {
	db *sql.DB
}

func NewTravelRepository(db *sql.DB) *TravelRepository {
	return &TravelRepository{db: db}
}

func (r *TravelRepository) GetAllTravels() ([]models.Travel, error) {
	query := `SELECT id, name, description, price, location, duration FROM travels`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var travels []models.Travel
	for rows.Next() {
		var t models.Travel
		err := rows.Scan(&t.ID, &t.Name, &t.Description, &t.Price, &t.Location, &t.Duration)
		if err != nil {
			return nil, err
		}
		travels = append(travels, t)
	}
	return travels, nil
}

func (r *TravelRepository) CreateTravel(travel *models.CreateTravelRequest) error {
	query := `
		INSERT INTO travels (name, description, price, location, duration) 
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(query, travel.Name, travel.Description, travel.Price, travel.Location, travel.Duration)
	return err
}