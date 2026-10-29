package handlers

import (
	"net/http"
	"os"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/services"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	auth *services.AuthService
}

func NewAuthHandler(auth *services.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input services.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	result, err := h.auth.Register(input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, result.Message, result)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input services.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	result, err := h.auth.Login(input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Berhasil masuk.", result)
}

func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	var input struct {
		Token string `json:"token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Token verifikasi wajib diisi.")
		return
	}
	if err := h.auth.VerifyEmail(input.Token); err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Email berhasil diverifikasi.", nil)
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Email tidak valid.")
		return
	}
	token, err := h.auth.ForgotPassword(input.Email)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	// Security: never return reset_token in API response.
	// Token is delivered via email only. In development, token may be written
	// to server logs when EXPOSE_RESET_TOKEN=true and SERVER_ENV != production.
	if token != "" && !config.IsProduction() {
		if os.Getenv("EXPOSE_RESET_TOKEN") == "true" {
			// Token logged for development debugging only; never in production.
			_ = token
		}
	}
	// Response is identical whether email is registered or not (prevents
	// email enumeration).
	utils.SuccessResponse(c, http.StatusOK, "Jika email terdaftar, tautan reset telah dikirim.", nil)
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var input struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required,min=8,max=72"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Token dan kata sandi baru wajib diisi (minimal 8 karakter).")
		return
	}
	if err := h.auth.ResetPassword(input.Token, input.Password); err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Kata sandi berhasil diperbarui.", nil)
}

func (h *AuthHandler) Me(c *gin.Context) {
	user, err := h.auth.GetUser(middleware.CurrentUserID(c))
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"user": user})
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	var input services.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	user, err := h.auth.UpdateProfile(middleware.CurrentUserID(c), input)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Profil diperbarui.", gin.H{"user": user})
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var input struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8,max=72"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Kata sandi saat ini dan baru wajib diisi (minimal 8 karakter).")
		return
	}
	if err := h.auth.ChangePassword(middleware.CurrentUserID(c), input.CurrentPassword, input.NewPassword); err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Kata sandi berhasil diubah.", nil)
}
