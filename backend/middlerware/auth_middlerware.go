package middleware

import (
	"net/http"
	"strings"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Contoh sederhana middleware autentikasi
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Token tidak ditemukan", http.StatusUnauthorized)
			return
		}

		bearerToken := strings.Split(authHeader, "Bearer ")
		if len(bearerToken) != 2 {
			http.Error(w, "Format token salah", http.StatusUnauthorized)
			return
		}

		// Validasi token di sini
		// Token validation logic would go here

		next.ServeHTTP(w, r)
	})
}