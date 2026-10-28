package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

func validationMessage(err error) string {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		parts := make([]string, 0, len(validationErrors))
		for _, field := range validationErrors {
			name := field.Field()
			switch field.Tag() {
			case "required":
				parts = append(parts, name+" wajib diisi")
			case "email":
				parts = append(parts, name+" harus berupa email yang valid")
			case "min":
				parts = append(parts, name+" minimal "+field.Param()+" karakter")
			case "max":
				parts = append(parts, name+" maksimal "+field.Param()+" karakter")
			case "gt":
				parts = append(parts, name+" harus lebih besar dari "+field.Param())
			default:
				parts = append(parts, name+" tidak valid")
			}
		}
		return strings.Join(parts, ", ")
	}
	return "Data yang dikirim tidak valid."
}

func parseID(c *gin.Context, key string) (uint, bool) {
	raw := c.Param(key)
	id, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || id == 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID tidak valid.")
		return 0, false
	}
	return uint(id), true
}

// audit records an important administrative action.
func audit(c *gin.Context, db *gorm.DB, action, entityType, entityID string, before, after interface{}) {
	actorID := middleware.CurrentUserID(c)
	var actorPtr *uint
	if actorID > 0 {
		actorPtr = &actorID
	}
	log := models.AuditLog{
		ActorID:    actorPtr,
		ActorName:  middleware.CurrentUserName(c),
		Action:     action,
		EntityType: entityType,
		EntityID:   entityID,
		Before:     marshalSafe(before),
		After:      marshalSafe(after),
		IPAddress:  c.ClientIP(),
		UserAgent:  c.GetHeader("User-Agent"),
	}
	if err := db.Create(&log).Error; err != nil {
		_ = c.Error(err)
	}
}

func marshalSafe(value interface{}) string {
	if value == nil {
		return ""
	}
	b, err := json.Marshal(value)
	if err != nil {
		return ""
	}
	if len(b) > 60000 {
		return string(b[:60000])
	}
	return string(b)
}

func csvEscape(value string) string {
	value = strings.ReplaceAll(value, `"`, `""`)
	return `"` + value + `"`
}

func writeCSV(c *gin.Context, filename string, rows [][]string) {
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	for _, row := range rows {
		parts := make([]string, len(row))
		for i, cell := range row {
			parts[i] = csvEscape(cell)
		}
		_, _ = c.Writer.WriteString(strings.Join(parts, ",") + "\r\n")
	}
}
