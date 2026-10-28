package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// Settings holds runtime configuration loaded from environment variables.
type Settings struct {
	Env              string
	Port             string
	JWTSecret        string
	JWTExpiry        time.Duration
	FrontendURL      string
	APIBaseURL       string
	PaymentProvider  string
	PaymentSecret    string
	TaxPercent       float64
	HoldMinutes      int
	SMTPHost         string
	SMTPPort         int
	SMTPUser         string
	SMTPPassword     string
	EmailFrom        string
	WhatsAppNumber   string
	BusinessName     string
	BusinessEmail    string
	BusinessPhone    string
	BusinessAddress  string
	AllowedOrigins   []string
	RateLimitPerMin  int
}

var App Settings

func LoadSettings() Settings {
	App = Settings{
		Env:             getEnv("SERVER_ENV", "development"),
		Port:            getEnv("SERVER_PORT", "8000"),
		JWTSecret:       getEnv("JWT_SECRET", "dev-only-change-me"),
		JWTExpiry:       parseDuration(getEnv("JWT_EXPIRY", "168h"), 168*time.Hour),
		FrontendURL:     strings.TrimRight(getEnv("FRONTEND_URL", "http://localhost:5173"), "/"),
		APIBaseURL:      strings.TrimRight(getEnv("API_BASE_URL", "http://localhost:8000"), "/"),
		PaymentProvider: getEnv("PAYMENT_PROVIDER", "mock"),
		PaymentSecret:   getEnv("PAYMENT_GATEWAY_SECRET", "mock-secret"),
		TaxPercent:      parseFloat(getEnv("TAX_PERCENT", "0"), 0),
		HoldMinutes:     parseInt(getEnv("BOOKING_HOLD_MINUTES", "30"), 30),
		SMTPHost:        getEnv("EMAIL_HOST", ""),
		SMTPPort:        parseInt(getEnv("EMAIL_PORT", "587"), 587),
		SMTPUser:        getEnv("EMAIL_USER", ""),
		SMTPPassword:    getEnv("EMAIL_PASSWORD", ""),
		EmailFrom:       getEnv("EMAIL_FROM", "noreply@rinjanitravel.com"),
		WhatsAppNumber:  getEnv("WHATSAPP_PHONE_NUMBER", "6281234567890"),
		BusinessName:    getEnv("BUSINESS_NAME", "Rinjani Travel"),
		BusinessEmail:   getEnv("BUSINESS_EMAIL", "hello@rinjanitravel.com"),
		BusinessPhone:   getEnv("BUSINESS_PHONE", "+62 812-3456-7890"),
		BusinessAddress: getEnv("BUSINESS_ADDRESS", "Jl. Raya Sembalun, Lombok Timur, Nusa Tenggara Barat"),
		AllowedOrigins:  splitCSV(getEnv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")),
		RateLimitPerMin: parseInt(getEnv("RATE_LIMIT_PER_MINUTE", "60"), 60),
	}

	if App.Env == "production" && (App.JWTSecret == "" || App.JWTSecret == "dev-only-change-me") {
		panic("JWT_SECRET must be set in production")
	}
	return App
}

func IsProduction() bool { return App.Env == "production" }

func getEnv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func parseInt(value string, fallback int) int {
	n, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return fallback
	}
	return n
}

func parseFloat(value string, fallback float64) float64 {
	n, err := strconv.ParseFloat(strings.TrimSpace(value), 64)
	if err != nil {
		return fallback
	}
	return n
}

func parseDuration(value string, fallback time.Duration) time.Duration {
	d, err := time.ParseDuration(strings.TrimSpace(value))
	if err != nil {
		return fallback
	}
	return d
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
