package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	_ "github.com/lib/pq"

	"github.com/torikallcode/rinjani-travel/internal/config"
	"github.com/torikallcode/rinjani-travel/internal/repository"
	"github.com/torikallcode/rinjani-travel/internal/services"
	"github.com/torikallcode/rinjani-travel/internal/handlers"
	customMiddleware "github.com/torikallcode/rinjani-travel/pkg/middleware"
)

func main() {
	// Muat Konfigurasi
	cfg := config.LoadConfig()

	// Koneksi Database
	db, err := setupDatabase(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Gagal terhubung ke database: %v", err)
	}
	defer db.Close()

	// Migrasi Database
	if err := migrateDatabase(db); err != nil {
		log.Fatalf("Gagal melakukan migrasi database: %v", err)
	}

	// Inisialisasi Repository
	userRepo := repository.NewUserRepository(db)
	travelRepo := repository.NewTravelRepository(db)
	bookingRepo := repository.NewBookingRepository(db)

	// Inisialisasi Services
	userService := services.NewUserService(userRepo)
	travelService := services.NewTravelService(travelRepo)
	bookingService := services.NewBookingService(bookingRepo)

	// Inisialisasi Handlers
	userHandler := handlers.NewUserHandler(userService)
	travelHandler := handlers.NewTravelHandler(travelService)
	bookingHandler := handlers.NewBookingHandler(bookingService)

	// Setup Router
	router := setupRouter(
		userHandler, 
		travelHandler, 
		bookingHandler
	)

	// Server Configuration
	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", cfg.ServerPort),
		Handler: router,
	}

	// Logging Server Start
	log.Printf("🚀 Server berjalan di port %s", cfg.ServerPort)
	log.Fatal(server.ListenAndServe())
}

func setupDatabase(connectionString string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, fmt.Errorf("gagal membuka koneksi database: %v", err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("gagal melakukan ping database: %v", err)
	}

	return db, nil
}

func migrateDatabase(db *sql.DB) error {
	// Definisi skema database
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(50) UNIQUE NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS travels (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			description TEXT,
			price DECIMAL(10,2) NOT NULL,
			location VARCHAR(100) NOT NULL,
			duration INTEGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS bookings (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id),
			travel_id INTEGER REFERENCES travels(id),
			booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			total_price DECIMAL(10,2) NOT NULL
		);
	`)

	return err
}

func setupRouter(
	userHandler *handlers.UserHandler,
	travelHandler *handlers.TravelHandler,
	bookingHandler *handlers.BookingHandler,
) http.Handler {
	router := mux.NewRouter()

	// CORS Configuration
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	// Global Middleware
	router.Use(customMiddleware.LoggingMiddleware)
	router.Use(customMiddleware.AuthMiddleware)

	// User Routes
	router.HandleFunc("/user/register", userHandler.RegisterUser).Methods("POST")
	router.HandleFunc("/user/login", userHandler.LoginUser).Methods("POST")

	// Travel Routes
	router.HandleFunc("/travels", travelHandler.GetAllTravels).Methods("GET")
	router.HandleFunc("/travels", travelHandler.CreateTravel).Methods("POST")

	// Booking Routes
	router.HandleFunc("/bookings", bookingHandler.CreateBooking).Methods("POST")
	router.HandleFunc("/bookings/{userId}", bookingHandler.GetUserBookings).Methods("GET")

	// Wrap router with CORS handler
	return corsHandler(router)
}