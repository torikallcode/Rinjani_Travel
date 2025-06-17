package config

import (
	"os"
	"log"
)

type Config struct {
	DatabaseURL string
	ServerPort string
	JWTSecret  string
}

func LoadConfig() *Config {
	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://user:pass@localhost/rinjani_travel"),
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		JWTSecret:   getEnv("JWT_SECRET", "rahasia_rinjani_travel_2025"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Printf("Menggunakan default value untuk %s", key)
		return defaultValue
	}
	return value
}