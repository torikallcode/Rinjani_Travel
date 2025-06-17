package models

type Travel struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Location    string  `json:"location"`
	Duration    int     `json:"duration"`
}

type CreateTravelRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Location    string  `json:"location"`
	Duration    int     `json:"duration"`
}