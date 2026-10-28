package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDatabase() *gorm.DB {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	logLevel := logger.Info
	if IsProduction() {
		logLevel = logger.Warn
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time { return time.Now().Local() },
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}

	maxOpenConns := parseInt(os.Getenv("DB_MAX_OPEN_CONNS"), 25)
	maxIdleConns := parseInt(os.Getenv("DB_MAX_IDLE_CONNS"), 5)
	connLifetime := parseDuration(os.Getenv("DB_CONN_MAX_LIFETIME"), 5*time.Minute)

	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetConnMaxLifetime(connLifetime)
	sqlDB.SetConnMaxIdleTime(2 * time.Minute)

	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}

	log.Println("✓ Database connection established successfully")
	return db
}

// EnsureDatabase creates the configured database when it does not exist.
// It is only used by the optional bootstrap helper.
func EnsureDatabase() error {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
	)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		return err
	}
	name := os.Getenv("DB_NAME")
	if name == "" {
		return fmt.Errorf("DB_NAME is empty")
	}
	return db.Exec("CREATE DATABASE IF NOT EXISTS `" + name + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci").Error
}

func DatabaseStats(db *gorm.DB) map[string]interface{} {
	sqlDB, err := db.DB()
	if err != nil {
		return map[string]interface{}{"status": "error"}
	}
	stats := sqlDB.Stats()
	return map[string]interface{}{
		"open_connections": stats.OpenConnections,
		"in_use":           stats.InUse,
		"idle":             stats.Idle,
		"max_open":         stats.MaxOpenConnections,
	}
}
