package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// APIError is a domain error with an HTTP status code.
type APIError struct {
	Status  int
	Message string
	Details interface{}
}

func (e *APIError) Error() string { return e.Message }

func NewError(status int, message string) *APIError {
	return &APIError{Status: status, Message: message}
}

func BadRequest(message string) *APIError  { return NewError(http.StatusBadRequest, message) }
func Unauthorized(message string) *APIError { return NewError(http.StatusUnauthorized, message) }
func Forbidden(message string) *APIError   { return NewError(http.StatusForbidden, message) }
func NotFound(message string) *APIError    { return NewError(http.StatusNotFound, message) }
func Conflict(message string) *APIError    { return NewError(http.StatusConflict, message) }
func Unprocessable(message string) *APIError {
	return NewError(http.StatusUnprocessableEntity, message)
}

func RespondError(c *gin.Context, err error) {
	var apiErr *APIError
	if errors.As(err, &apiErr) {
		if apiErr.Details != nil {
			c.JSON(apiErr.Status, Response{
				Meta: ResponseMeta{Status: "error", Message: apiErr.Message, Code: apiErr.Status},
				Data: apiErr.Details,
			})
			return
		}
		ErrorResponse(c, apiErr.Status, apiErr.Message)
		return
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		ErrorResponse(c, http.StatusNotFound, "Data tidak ditemukan.")
		return
	}
	ErrorResponse(c, http.StatusInternalServerError, "Terjadi kesalahan pada server.")
}

func RandomToken(bytes int) (string, error) {
	b := make([]byte, bytes)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func Slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var b strings.Builder
	lastDash := false
	for _, r := range value {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			lastDash = false
		case r == ' ' || r == '-' || r == '_' || r == '/':
			if !lastDash && b.Len() > 0 {
				b.WriteByte('-')
				lastDash = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}

func QueryInt(c *gin.Context, key string, fallback int) int {
	raw := strings.TrimSpace(c.Query(key))
	if raw == "" {
		return fallback
	}
	n, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return n
}

func QueryInt64(c *gin.Context, key string, fallback int64) int64 {
	raw := strings.TrimSpace(c.Query(key))
	if raw == "" {
		return fallback
	}
	n, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		return fallback
	}
	return n
}

func Pagination(c *gin.Context) (page int, pageSize int, offset int) {
	page = QueryInt(c, "page", 1)
	pageSize = QueryInt(c, "page_size", 12)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 12
	}
	if pageSize > 100 {
		pageSize = 100
	}
	offset = (page - 1) * pageSize
	return
}

func RoundIDR(value float64) int64 {
	return int64(math.Round(value))
}

func MarshalJSON(value interface{}) string {
	b, err := json.Marshal(value)
	if err != nil {
		return ""
	}
	return string(b)
}
