package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"strings"
	"sync"
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

const CtxRequestID = "request_id"

// RequestID adds a request identifier for logs and traceability.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.GetHeader("X-Request-ID")
		if id == "" {
			b := make([]byte, 8)
			_, _ = rand.Read(b)
			id = hex.EncodeToString(b)
		}
		c.Set(CtxRequestID, id)
		c.Writer.Header().Set("X-Request-ID", id)
		c.Next()
	}
}

// SecurityHeaders adds baseline hardening headers to every response.
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		c.Writer.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Writer.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		if config.IsProduction() {
			c.Writer.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		c.Next()
	}
}

type rateWindow struct {
	count int
	reset time.Time
}

type rateLimiter struct {
	mu      sync.Mutex
	entries map[string]*rateWindow
	limit   int
	window  time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{entries: make(map[string]*rateWindow), limit: limit, window: window}
}

func (r *rateLimiter) allow(key string) (bool, int) {
	r.mu.Lock()
	defer r.mu.Unlock()
	now := time.Now()
	entry, ok := r.entries[key]
	if !ok || now.After(entry.reset) {
		r.entries[key] = &rateWindow{count: 1, reset: now.Add(r.window)}
		return true, r.limit - 1
	}
	if entry.count >= r.limit {
		return false, 0
	}
	entry.count++
	return true, r.limit - entry.count
}

func (r *rateLimiter) cleanup() {
	r.mu.Lock()
	defer r.mu.Unlock()
	now := time.Now()
	for key, entry := range r.entries {
		if now.After(entry.reset) {
			delete(r.entries, key)
		}
	}
}

// RateLimit limits requests per client IP for sensitive endpoints.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	if limit <= 0 {
		limit = 60
	}
	limiter := newRateLimiter(limit, window)
	go func() {
		ticker := time.NewTicker(window)
		for range ticker.C {
			limiter.cleanup()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()
		key := ip + ":" + c.FullPath()
		ok, remaining := limiter.allow(key)
		c.Writer.Header().Set("X-RateLimit-Limit", itoa(limit))
		c.Writer.Header().Set("X-RateLimit-Remaining", itoa(remaining))
		if !ok {
			c.Writer.Header().Set("Retry-After", itoa(int(window.Seconds())))
			utils.ErrorResponse(c, http.StatusTooManyRequests, "Terlalu banyak permintaan. Coba lagi beberapa saat.")
			c.Abort()
			return
		}
		c.Next()
	}
}

// DefaultRateLimit uses the configured global per-minute limit.
func DefaultRateLimit() gin.HandlerFunc {
	return RateLimit(config.App.RateLimitPerMin, time.Minute)
}

// StrictRateLimit is used for auth and payment creation.
func StrictRateLimit() gin.HandlerFunc {
	return RateLimit(10, time.Minute)
}

// CORS allows the configured frontend origins and local development origins.
func CORS() gin.HandlerFunc {
	allowed := make(map[string]bool)
	for _, origin := range config.App.AllowedOrigins {
		allowed[strings.TrimRight(origin, "/")] = true
	}
	allowed["http://localhost:5173"] = true
	allowed["http://127.0.0.1:5173"] = true

	return func(c *gin.Context) {
		origin := strings.TrimRight(c.GetHeader("Origin"), "/")
		if origin != "" && (allowed[origin] || !config.IsProduction()) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept, Authorization, X-Requested-With, X-Request-ID, Idempotency-Key, X-Signature, X-Callback-Token")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
