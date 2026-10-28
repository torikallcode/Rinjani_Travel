package repository

import (
	"database/sql"
	"rinjani-travel-backend/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Register(req *models.RegisterRequest) error {
	query := `INSERT INTO users (username, email, password) VALUES ($1, $2, $3)`
	_, err := r.db.Exec(query, req.Username, req.Email, req.Password)
	return err
}

func (r *UserRepository) Login(email, password string) (*models.User, error) {
	query := `SELECT id, username, email, password, created_at FROM users WHERE email = $1`
	row := r.db.QueryRow(query, email)
	
	var user models.User
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	
	// ponytail: no password hashing, add bcrypt when auth matters
	if user.Password != password {
		return nil, sql.ErrNoRows
	}
	
	return &user, nil
}
