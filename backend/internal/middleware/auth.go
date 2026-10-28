package middleware

import (
	"net/http"
	"strings"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const (
	CtxUserID    = "user_id"
	CtxUserRole  = "user_role"
	CtxUserEmail = "user_email"
	CtxUserName  = "user_name"
)

// Claims is the JWT payload used by the API.
type Claims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	jwt.RegisteredClaims
}

func GenerateToken(user models.User) (string, error) {
	now := nowFunc()
	claims := Claims{
		UserID: user.ID,
		Role:   user.Role,
		Email:  user.Email,
		Name:   user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.Email,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(config.App.JWTExpiry)),
			Issuer:    "rinjani-travel",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.App.JWTSecret))
}

func ParseToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.App.JWTSecret), nil
	}, jwt.WithValidMethods([]string{"HS256"}))
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}

// AuthMiddleware requires a valid Bearer token.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Sesi tidak ditemukan. Silakan masuk terlebih dahulu.")
			c.Abort()
			return
		}
		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Format autentikasi tidak valid.")
			c.Abort()
			return
		}
		claims, err := ParseToken(strings.TrimSpace(parts[1]))
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Sesi tidak valid atau sudah kedaluwarsa.")
			c.Abort()
			return
		}
		c.Set(CtxUserID, claims.UserID)
		c.Set(CtxUserRole, claims.Role)
		c.Set(CtxUserEmail, claims.Email)
		c.Set(CtxUserName, claims.Name)
		c.Next()
	}
}

// OptionalAuth populates the user context when a valid token is present.
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header != "" {
			parts := strings.SplitN(header, " ", 2)
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
				if claims, err := ParseToken(strings.TrimSpace(parts[1])); err == nil {
					c.Set(CtxUserID, claims.UserID)
					c.Set(CtxUserRole, claims.Role)
					c.Set(CtxUserEmail, claims.Email)
					c.Set(CtxUserName, claims.Name)
				}
			}
		}
		c.Next()
	}
}

func CurrentUserID(c *gin.Context) uint {
	if value, ok := c.Get(CtxUserID); ok {
		if id, ok := value.(uint); ok {
			return id
		}
	}
	return 0
}

func CurrentUserRole(c *gin.Context) string {
	if value, ok := c.Get(CtxUserRole); ok {
		if role, ok := value.(string); ok {
			return role
		}
	}
	return ""
}

func CurrentUserName(c *gin.Context) string {
	if value, ok := c.Get(CtxUserName); ok {
		if name, ok := value.(string); ok {
			return name
		}
	}
	return ""
}

// RequireRoles allows only the supplied roles.
func RequireRoles(roles ...string) gin.HandlerFunc {
	allowed := make(map[string]bool, len(roles))
	for _, role := range roles {
		allowed[role] = true
	}
	return func(c *gin.Context) {
		role := CurrentUserRole(c)
		if !allowed[role] {
			utils.ErrorResponse(c, http.StatusForbidden, "Anda tidak memiliki akses ke modul ini.")
			c.Abort()
			return
		}
		c.Next()
	}
}

// AdminMiddleware allows every administrative role.
func AdminMiddleware() gin.HandlerFunc {
	return RequireRoles(models.RoleAdminOps, models.RoleAdminContent, models.RoleSuperAdmin)
}

// SuperAdminMiddleware allows only super admins.
func SuperAdminMiddleware() gin.HandlerFunc {
	return RequireRoles(models.RoleSuperAdmin)
}
