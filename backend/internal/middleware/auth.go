package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware - Check if user is authenticated (basic check for now)
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// For now, just check if Bearer token exists
		// In production, validate JWT token here
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// AdminMiddleware - Check if user is admin
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Check user role from token/session
		// For now, just pass through
		c.Next()
	}
}
