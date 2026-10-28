package handlers

import (
	"net/http"
	"strings"
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/middleware"
	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/services"
	"rinjani-travel-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db   *gorm.DB
	auth *services.AuthService
}

func NewAdminHandler(db *gorm.DB, auth *services.AuthService) *AdminHandler {
	return &AdminHandler{db: db, auth: auth}
}

func (h *AdminHandler) Dashboard(c *gin.Context) {
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	tomorrow := todayStart.AddDate(0, 0, 1)
	inSevenDays := todayStart.AddDate(0, 0, 7)

	var todayBookings, pendingPayments, upcomingDepartures int64
	var todayRevenue, monthRevenue int64
	var monthBookings int64

	h.db.Model(&models.Booking{}).Where("created_at >= ? AND created_at < ?", todayStart, tomorrow).Count(&todayBookings)
	h.db.Model(&models.Payment{}).Where("status = ?", models.PaymentPending).Count(&pendingPayments)
	h.db.Model(&models.PackageDeparture{}).Where("start_date >= ? AND start_date <= ? AND status = ?", todayStart.Format("2006-01-02"), inSevenDays.Format("2006-01-02"), "open").Count(&upcomingDepartures)
	h.db.Model(&models.Booking{}).Where("created_at >= ? AND status IN ?", todayStart, []string{models.BookingPaid, models.BookingConfirmed, models.BookingCompleted}).Select("COALESCE(SUM(total),0)").Scan(&todayRevenue)
	h.db.Model(&models.Booking{}).Where("created_at >= ? AND status IN ?", monthStart, []string{models.BookingPaid, models.BookingConfirmed, models.BookingCompleted}).Select("COALESCE(SUM(total),0)").Scan(&monthRevenue)
	h.db.Model(&models.Booking{}).Where("created_at >= ?", monthStart).Count(&monthBookings)

	type occupancyRow struct {
		ID            uint   `json:"id"`
		StartDate     string `json:"start_date"`
		Capacity      int    `json:"capacity"`
		ReservedCount int    `json:"reserved_count"`
		PackageTitle  string `json:"package_title"`
		PackageSlug   string `json:"package_slug"`
	}
	var occupancy []occupancyRow
	h.db.Table("package_departures").
		Select("package_departures.id, package_departures.start_date, package_departures.capacity, package_departures.reserved_count, packages.title as package_title, packages.slug as package_slug").
		Joins("JOIN packages ON packages.id = package_departures.package_id").
		Where("package_departures.start_date >= ? AND package_departures.start_date <= ?", todayStart.Format("2006-01-02"), inSevenDays.Format("2006-01-02")).
		Order("package_departures.start_date ASC").Limit(8).Scan(&occupancy)

	type revenuePoint struct {
		Date  string `json:"date"`
		Total int64  `json:"total"`
	}
	var revenueSeries []revenuePoint
	h.db.Table("bookings").
		Select("DATE(created_at) as date, COALESCE(SUM(total),0) as total").
		Where("created_at >= ? AND status IN ?", todayStart.AddDate(0, 0, -13), []string{models.BookingPaid, models.BookingConfirmed, models.BookingCompleted}).
		Group("DATE(created_at)").Order("date ASC").Scan(&revenueSeries)

	var recentBookings []models.Booking
	h.db.Preload("Departure").Preload("Departure.Package").Preload("User").
		Order("created_at DESC").Limit(8).Find(&recentBookings)

	var upcoming []models.PackageDeparture
	h.db.Preload("Package").
		Where("start_date >= ? AND status = ?", todayStart.Format("2006-01-02"), "open").
		Order("start_date ASC").Limit(8).Find(&upcoming)

	tasks := make([]gin.H, 0)
	var unpaid int64
	h.db.Model(&models.Booking{}).Where("status = ? AND expires_at IS NOT NULL AND expires_at < ?", models.BookingPendingPayment, now.Add(2*time.Hour)).Count(&unpaid)
	if unpaid > 0 {
		tasks = append(tasks, gin.H{"type": "payment", "label": "Pembayaran menunggu / hampir kedaluwarsa", "count": unpaid, "link": "/admin/payments?status=pending"})
	}
	var pendingReviews int64
	h.db.Model(&models.Review{}).Where("status = ?", "pending").Count(&pendingReviews)
	if pendingReviews > 0 {
		tasks = append(tasks, gin.H{"type": "review", "label": "Ulasan menunggu moderasi", "count": pendingReviews, "link": "/admin/reviews"})
	}
	var newContacts int64
	h.db.Model(&models.ContactMessage{}).Where("status = ?", "new").Count(&newContacts)
	if newContacts > 0 {
		tasks = append(tasks, gin.H{"type": "contact", "label": "Pesan kontak baru", "count": newContacts, "link": "/admin/content?tab=messages"})
	}

	utils.SuccessResponse(c, http.StatusOK, "", gin.H{
		"today_bookings":      todayBookings,
		"today_revenue":       todayRevenue,
		"month_revenue":       monthRevenue,
		"month_bookings":      monthBookings,
		"pending_payments":    pendingPayments,
		"upcoming_departures": upcomingDepartures,
		"occupancy":           occupancy,
		"revenue_series":      revenueSeries,
		"recent_bookings":     recentBookings,
		"upcoming":            upcoming,
		"tasks":               tasks,
	})
}

func (h *AdminHandler) Customers(c *gin.Context) {
	page, pageSize, offset := utils.Pagination(c)
	query := h.db.Model(&models.User{}).Where("role = ?", models.RoleCustomer)
	if q := strings.TrimSpace(c.Query("q")); q != "" {
		like := "%" + q + "%"
		query = query.Where("name LIKE ? OR email LIKE ? OR phone LIKE ?", like, like, like)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	var users []models.User
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	type customerRow struct {
		models.User
		BookingCount int64 `json:"booking_count"`
		TotalSpent   int64 `json:"total_spent"`
	}
	rows := make([]customerRow, 0, len(users))
	for _, user := range users {
		var count int64
		var spent int64
		h.db.Model(&models.Booking{}).Where("user_id = ?", user.ID).Count(&count)
		h.db.Model(&models.Booking{}).Where("user_id = ? AND status IN ?", user.ID, []string{models.BookingPaid, models.BookingConfirmed, models.BookingCompleted}).Select("COALESCE(SUM(total),0)").Scan(&spent)
		rows = append(rows, customerRow{User: user, BookingCount: count, TotalSpent: spent})
	}
	utils.PaginatedResponse(c, http.StatusOK, rows, total, page, pageSize)
}

func (h *AdminHandler) CustomerDetail(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var user models.User
	if err := h.db.First(&user, id).Error; err != nil {
		utils.RespondError(c, utils.NotFound("Pelanggan tidak ditemukan."))
		return
	}
	var bookings []models.Booking
	h.db.Preload("Departure").Preload("Departure.Package").Where("user_id = ?", id).Order("created_at DESC").Find(&bookings)
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"user": user, "bookings": bookings})
}

func (h *AdminHandler) Staff(c *gin.Context) {
	var users []models.User
	if err := h.db.Where("role IN ?", []string{models.RoleAdminOps, models.RoleAdminContent, models.RoleSuperAdmin}).
		Order("created_at ASC").Find(&users).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"items": users, "total": len(users)})
}

func (h *AdminHandler) CreateStaff(c *gin.Context) {
	var input struct {
		services.RegisterInput
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	user, err := h.auth.CreateStaff(input.RegisterInput, input.Role)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "staff.create", "user", user.Email, nil, gin.H{"role": user.Role})
	utils.SuccessResponse(c, http.StatusCreated, "Staf berhasil dibuat.", user)
}

func (h *AdminHandler) UpdateStaff(c *gin.Context) {
	id, ok := parseID(c, "id")
	if !ok {
		return
	}
	var input struct {
		Name   string `json:"name" binding:"required"`
		Phone  string `json:"phone"`
		Role   string `json:"role" binding:"required"`
		Active bool   `json:"active"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, validationMessage(err))
		return
	}
	user, err := h.auth.UpdateStaff(id, input.Name, input.Phone, input.Role, input.Active)
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	audit(c, h.db, "staff.update", "user", user.Email, nil, gin.H{"role": user.Role, "active": user.IsActive})
	utils.SuccessResponse(c, http.StatusOK, "Staf diperbarui.", user)
}

func (h *AdminHandler) AuditLogs(c *gin.Context) {
	page, pageSize, offset := utils.Pagination(c)
	query := h.db.Model(&models.AuditLog{})
	if action := c.Query("action"); action != "" {
		query = query.Where("action = ?", action)
	}
	if entity := c.Query("entity_type"); entity != "" {
		query = query.Where("entity_type = ?", entity)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	var items []models.AuditLog
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.PaginatedResponse(c, http.StatusOK, items, total, page, pageSize)
}

func (h *AdminHandler) Settings(c *gin.Context) {
	var settings []models.Setting
	if err := h.db.Order("setting_key ASC").Find(&settings).Error; err != nil {
		utils.RespondError(c, err)
		return
	}
	values := make(map[string]string, len(settings))
	for _, setting := range settings {
		values[setting.SettingKey] = setting.Value
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"settings": values})
}

func (h *AdminHandler) UpdateSettings(c *gin.Context) {
	var input map[string]string
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format pengaturan tidak valid.")
		return
	}
	allowed := map[string]bool{
		"business_name": true, "business_email": true, "business_phone": true,
		"business_address": true, "whatsapp": true, "instagram": true,
		"tax_percent": true, "booking_hold_minutes": true, "payment_instructions": true,
		"cancellation_policy_summary": true, "safety_note": true,
	}
	for key, value := range input {
		if !allowed[key] {
			continue
		}
		setting := models.Setting{SettingKey: key, Value: value}
		if err := h.db.Where("setting_key = ?", key).Assign(models.Setting{Value: value}).FirstOrCreate(&setting).Error; err != nil {
			utils.RespondError(c, err)
			return
		}
	}
	audit(c, h.db, "settings.update", "setting", "business", nil, input)
	utils.SuccessResponse(c, http.StatusOK, "Pengaturan disimpan.", nil)
}

func (h *AdminHandler) PublicSettings(c *gin.Context) {
	var settings []models.Setting
	h.db.Where("setting_key IN ?", []string{"business_name", "business_email", "business_phone", "business_address", "whatsapp", "instagram", "safety_note", "cancellation_policy_summary"}).Find(&settings)
	values := make(map[string]string, len(settings))
	for _, setting := range settings {
		values[setting.SettingKey] = setting.Value
	}
	if values["business_name"] == "" {
		values["business_name"] = config.App.BusinessName
	}
	if values["business_email"] == "" {
		values["business_email"] = config.App.BusinessEmail
	}
	if values["business_phone"] == "" {
		values["business_phone"] = config.App.BusinessPhone
	}
	if values["business_address"] == "" {
		values["business_address"] = config.App.BusinessAddress
	}
	if values["whatsapp"] == "" {
		values["whatsapp"] = config.App.WhatsAppNumber
	}
	utils.SuccessResponse(c, http.StatusOK, "", values)
}

func (h *AdminHandler) Profile(c *gin.Context) {
	user, err := h.auth.GetUser(middleware.CurrentUserID(c))
	if err != nil {
		utils.RespondError(c, err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", gin.H{"user": user})
}
