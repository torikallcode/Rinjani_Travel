package services

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/utils"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db    *gorm.DB
	email *EmailService
}

func NewAuthService(db *gorm.DB, email *EmailService) *AuthService {
	return &AuthService{db: db, email: email}
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email,max=150"`
	Phone    string `json:"phone" binding:"required,min=8,max=30"`
	Country  string `json:"country" binding:"max=80"`
	Password string `json:"password" binding:"required,min=8,max=72"`
}

type RegisterResult struct {
	User              models.User `json:"user"`
	Token             string      `json:"token"`
	VerificationToken string      `json:"verification_token,omitempty"`
	Message           string      `json:"message"`
}

func (s *AuthService) Register(input RegisterInput) (*RegisterResult, error) {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	var existing models.User
	if err := s.db.Unscoped().Where("email = ?", email).First(&existing).Error; err == nil {
		return nil, utils.Conflict("Email sudah terdaftar. Silakan masuk atau gunakan email lain.")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	verifyToken, err := utils.RandomToken(24)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Name:                  strings.TrimSpace(input.Name),
		Email:                 email,
		Phone:                 strings.TrimSpace(input.Phone),
		Country:               strings.TrimSpace(input.Country),
		PasswordHash:          string(hash),
		Role:                  models.RoleCustomer,
		VerificationTokenHash: utils.HashToken(verifyToken),
		IsActive:              true,
	}
	if err := s.db.Create(&user).Error; err != nil {
		return nil, err
	}

	token, err := generateJWT(user)
	if err != nil {
		return nil, err
	}

	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", config.App.FrontendURL, verifyToken)
	body := fmt.Sprintf(`<p>Halo %s,</p><p>Terima kasih telah mendaftar di %s. Verifikasi email Anda melalui tautan berikut:</p><p><a href="%s">Verifikasi email</a></p><p>Tautan ini hanya dapat digunakan sekali.</p>`,
		user.Name, config.App.BusinessName, verifyURL)
	_ = s.email.Send(user.Email, "Verifikasi email - "+config.App.BusinessName, body)

	result := &RegisterResult{
		User:    user,
		Token:   token,
		Message: "Registrasi berhasil. Silakan verifikasi email Anda.",
	}
	if !config.IsProduction() {
		result.VerificationToken = verifyToken
	}
	return result, nil
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResult struct {
	User      models.User `json:"user"`
	Token     string      `json:"token"`
	ExpiresAt time.Time   `json:"expires_at"`
}

func (s *AuthService) Login(input LoginInput) (*LoginResult, error) {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, utils.Unauthorized("Email atau kata sandi salah.")
	}
	if !user.IsActive {
		return nil, utils.Forbidden("Akun Anda dinonaktifkan. Hubungi administrator.")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, utils.Unauthorized("Email atau kata sandi salah.")
	}
	token, err := generateJWT(user)
	if err != nil {
		return nil, err
	}
	return &LoginResult{User: user, Token: token, ExpiresAt: time.Now().Add(config.App.JWTExpiry)}, nil
}

func (s *AuthService) VerifyEmail(token string) error {
	hash := utils.HashToken(strings.TrimSpace(token))
	var user models.User
	if err := s.db.Where("verification_token_hash = ?", hash).First(&user).Error; err != nil {
		return utils.BadRequest("Tautan verifikasi tidak valid atau sudah digunakan.")
	}
	now := time.Now()
	if err := s.db.Model(&user).Updates(map[string]interface{}{
		"email_verified_at":       &now,
		"verification_token_hash": "",
	}).Error; err != nil {
		return err
	}
	return nil
}

func (s *AuthService) ForgotPassword(email string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		// Do not reveal whether the email exists.
		return "", nil
	}
	token, err := utils.RandomToken(24)
	if err != nil {
		return "", err
	}
	expires := time.Now().Add(1 * time.Hour)
	if err := s.db.Model(&user).Updates(map[string]interface{}{
		"reset_token_hash": utils.HashToken(token),
		"reset_expires_at": &expires,
	}).Error; err != nil {
		return "", err
	}
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", config.App.FrontendURL, token)
	body := fmt.Sprintf(`<p>Halo %s,</p><p>Kami menerima permintaan reset kata sandi. Tautan berlaku selama 1 jam:</p><p><a href="%s">Reset kata sandi</a></p><p>Abaikan email ini jika Anda tidak meminta reset.</p>`, user.Name, resetURL)
	_ = s.email.Send(user.Email, "Reset kata sandi - "+config.App.BusinessName, body)
	return token, nil
}

func (s *AuthService) ResetPassword(token, newPassword string) error {
	if len(newPassword) < 8 {
		return utils.BadRequest("Kata sandi minimal 8 karakter.")
	}
	hash := utils.HashToken(strings.TrimSpace(token))
	var user models.User
	if err := s.db.Where("reset_token_hash = ?", hash).First(&user).Error; err != nil {
		return utils.BadRequest("Tautan reset tidak valid atau sudah digunakan.")
	}
	if user.ResetExpiresAt == nil || user.ResetExpiresAt.Before(time.Now()) {
		return utils.BadRequest("Tautan reset sudah kedaluwarsa. Silakan minta tautan baru.")
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return s.db.Model(&user).Updates(map[string]interface{}{
		"password_hash":    string(passwordHash),
		"reset_token_hash": "",
		"reset_expires_at": nil,
	}).Error
}

func (s *AuthService) ChangePassword(userID uint, currentPassword, newPassword string) error {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return utils.NotFound("Pengguna tidak ditemukan.")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword)); err != nil {
		return utils.BadRequest("Kata sandi saat ini salah.")
	}
	if len(newPassword) < 8 {
		return utils.BadRequest("Kata sandi baru minimal 8 karakter.")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return s.db.Model(&user).Update("password_hash", string(hash)).Error
}

func (s *AuthService) GetUser(userID uint) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, utils.NotFound("Pengguna tidak ditemukan.")
	}
	return &user, nil
}

type UpdateProfileInput struct {
	Name                  string `json:"name" binding:"required,min=2,max=100"`
	Phone                 string `json:"phone" binding:"required,min=8,max=30"`
	Country               string `json:"country" binding:"max=80"`
	EmergencyContactName  string `json:"emergency_contact_name" binding:"max=100"`
	EmergencyContactPhone string `json:"emergency_contact_phone" binding:"max=30"`
}

func (s *AuthService) UpdateProfile(userID uint, input UpdateProfileInput) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, utils.NotFound("Pengguna tidak ditemukan.")
	}
	updates := map[string]interface{}{
		"name":                    strings.TrimSpace(input.Name),
		"phone":                   strings.TrimSpace(input.Phone),
		"country":                 strings.TrimSpace(input.Country),
		"emergency_contact_name":  strings.TrimSpace(input.EmergencyContactName),
		"emergency_contact_phone": strings.TrimSpace(input.EmergencyContactPhone),
	}
	if err := s.db.Model(&user).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) CreateStaff(input RegisterInput, role string) (*models.User, error) {
	if !models.IsValidRole(role) || role == models.RoleCustomer {
		return nil, utils.BadRequest("Role staf tidak valid.")
	}
	email := strings.ToLower(strings.TrimSpace(input.Email))
	var existing models.User
	if err := s.db.Unscoped().Where("email = ?", email).First(&existing).Error; err == nil {
		return nil, utils.Conflict("Email sudah terdaftar.")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	user := models.User{
		Name:            strings.TrimSpace(input.Name),
		Email:           email,
		Phone:           strings.TrimSpace(input.Phone),
		Country:         strings.TrimSpace(input.Country),
		PasswordHash:    string(hash),
		Role:            role,
		EmailVerifiedAt: &now,
		IsActive:        true,
	}
	if err := s.db.Create(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) UpdateStaff(id uint, name, phone, role string, active bool) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, utils.NotFound("Staf tidak ditemukan.")
	}
	if !models.IsValidRole(role) || role == models.RoleCustomer {
		return nil, utils.BadRequest("Role staf tidak valid.")
	}
	if err := s.db.Model(&user).Updates(map[string]interface{}{
		"name":      strings.TrimSpace(name),
		"phone":     strings.TrimSpace(phone),
		"role":      role,
		"is_active": active,
	}).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func generateJWT(user models.User) (string, error) {
	if user.ID == 0 {
		return "", errors.New("cannot generate token for empty user")
	}
	return generateToken(user)
}
