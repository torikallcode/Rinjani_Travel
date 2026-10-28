package services

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/utils"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BookingService struct {
	db    *gorm.DB
	email *EmailService
}

func NewBookingService(db *gorm.DB, email *EmailService) *BookingService {
	return &BookingService{db: db, email: email}
}

type TravelerInput struct {
	Name                  string      `json:"name" binding:"required,min=2,max=120"`
	BirthDate             *models.Date `json:"birth_date"`
	Gender                string      `json:"gender" binding:"max=20"`
	Nationality           string      `json:"nationality" binding:"max=80"`
	IDNumber              string      `json:"id_number" binding:"max=80"`
	EmergencyContactName  string      `json:"emergency_contact_name" binding:"max=120"`
	EmergencyContactPhone string      `json:"emergency_contact_phone" binding:"max=30"`
	HealthNote            string      `json:"health_note" binding:"max=1000"`
	HealthConsent         bool        `json:"health_consent"`
	IsOrganizer           bool        `json:"is_organizer"`
}

type AddonSelection struct {
	ID       uint `json:"id" binding:"required"`
	Quantity int  `json:"quantity"`
}

type QuoteInput struct {
	DepartureID   uint            `json:"departure_id" binding:"required"`
	Travelers     []TravelerInput `json:"travelers"`
	TravelersCount int            `json:"travelers_count"`
	Addons        []AddonSelection `json:"addons"`
	CouponCode    string          `json:"coupon_code"`
}

type QuoteAddon struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	UnitPrice   int64  `json:"unit_price"`
	Quantity    int    `json:"quantity"`
	Total       int64  `json:"total"`
	PricingType string `json:"pricing_type"`
}

type QuoteCoupon struct {
	Code        string `json:"code"`
	Type        string `json:"type"`
	Value       int64  `json:"value"`
	Description string `json:"description"`
}

type Quote struct {
	DepartureID    uint         `json:"departure_id"`
	PackageID      uint         `json:"package_id"`
	PackageTitle   string       `json:"package_title"`
	PackageSlug    string       `json:"package_slug"`
	StartDate      models.Date  `json:"start_date"`
	EndDate        models.Date  `json:"end_date"`
	SeatsLeft      int          `json:"seats_left"`
	TravelersCount int          `json:"travelers_count"`
	PricePerPerson int64        `json:"price_per_person"`
	Addons         []QuoteAddon `json:"addons"`
	Subtotal       int64        `json:"subtotal"`
	Discount       int64        `json:"discount"`
	Tax            int64        `json:"tax"`
	Total          int64        `json:"total"`
	Currency       string       `json:"currency"`
	Coupon         *QuoteCoupon `json:"coupon,omitempty"`
	HoldMinutes    int          `json:"hold_minutes"`
}

type CreateBookingInput struct {
	QuoteInput
	OrganizerName  string `json:"organizer_name" binding:"max=120"`
	OrganizerPhone string `json:"organizer_phone" binding:"max=30"`
	OrganizerEmail string `json:"organizer_email" binding:"omitempty,email,max=150"`
	Notes          string `json:"notes" binding:"max=2000"`
	Consent        bool   `json:"consent"`
}

func (s *BookingService) Quote(input QuoteInput) (*Quote, error) {
	return s.quoteWithDB(s.db, input)
}

func (s *BookingService) quoteWithDB(db *gorm.DB, input QuoteInput) (*Quote, error) {
	if input.DepartureID == 0 {
		return nil, utils.BadRequest("Tanggal keberangkatan wajib dipilih.")
	}
	travelersCount := len(input.Travelers)
	if travelersCount == 0 {
		travelersCount = input.TravelersCount
	}
	if travelersCount < 1 {
		travelersCount = 1
	}
	if travelersCount > 30 {
		return nil, utils.BadRequest("Jumlah peserta maksimal 30 orang per booking.")
	}

	var dep models.PackageDeparture
	if err := db.Preload("Package").First(&dep, input.DepartureID).Error; err != nil {
		return nil, utils.NotFound("Jadwal keberangkatan tidak ditemukan.")
	}
	if dep.Package == nil {
		return nil, utils.NotFound("Paket tidak ditemukan.")
	}
	if dep.Package.Status != "published" {
		return nil, utils.BadRequest("Paket ini sedang tidak tersedia untuk dipesan.")
	}
	if err := validateDepartureAvailability(dep, travelersCount); err != nil {
		return nil, err
	}

	price := dep.Package.BasePrice
	if dep.PriceOverride != nil && *dep.PriceOverride > 0 {
		price = *dep.PriceOverride
	}
	subtotal := price * int64(travelersCount)

	addons, addonTotal, err := s.calculateAddons(db, dep.PackageID, input.Addons, travelersCount)
	if err != nil {
		return nil, err
	}
	subtotal += addonTotal

	discount, coupon, err := s.calculateCoupon(db, strings.TrimSpace(input.CouponCode), subtotal)
	if err != nil {
		return nil, err
	}
	tax := calculateTax(subtotal - discount)

	return &Quote{
		DepartureID:    dep.ID,
		PackageID:      dep.PackageID,
		PackageTitle:   dep.Package.Title,
		PackageSlug:    dep.Package.Slug,
		StartDate:      dep.StartDate,
		EndDate:        dep.EndDate,
		SeatsLeft:      dep.SeatsLeft(),
		TravelersCount: travelersCount,
		PricePerPerson: price,
		Addons:         addons,
		Subtotal:       subtotal,
		Discount:       discount,
		Tax:            tax,
		Total:          subtotal - discount + tax,
		Currency:       "IDR",
		Coupon:         coupon,
		HoldMinutes:    config.App.HoldMinutes,
	}, nil
}

func validateDepartureAvailability(dep models.PackageDeparture, travelers int) error {
	if dep.Status != "open" {
		return utils.Conflict("Jadwal keberangkatan ini sudah ditutup.")
	}
	today := time.Now().Format("2006-01-02")
	if dep.StartDate.String() != "" && dep.StartDate.String() < today {
		return utils.Conflict("Tanggal keberangkatan sudah lewat.")
	}
	if !dep.BookingCutoff.Time.IsZero() && dep.BookingCutoff.String() < today {
		return utils.Conflict("Pemesanan untuk jadwal ini sudah melewati batas cut-off.")
	}
	if dep.SeatsLeft() < travelers {
		return utils.Conflict(fmt.Sprintf("Kuota tidak cukup. Sisa %d kursi untuk jadwal ini.", dep.SeatsLeft()))
	}
	return nil
}

func (s *BookingService) calculateAddons(db *gorm.DB, packageID uint, selections []AddonSelection, travelers int) ([]QuoteAddon, int64, error) {
	if len(selections) == 0 {
		return []QuoteAddon{}, 0, nil
	}
	ids := make([]uint, 0, len(selections))
	for _, sel := range selections {
		if sel.Quantity < 0 {
			return nil, 0, utils.BadRequest("Jumlah add-on tidak valid.")
		}
		ids = append(ids, sel.ID)
	}
	var addons []models.PackageAddon
	if err := db.Where("package_id = ? AND active = ? AND id IN ?", packageID, true, ids).Find(&addons).Error; err != nil {
		return nil, 0, err
	}
	byID := make(map[uint]models.PackageAddon, len(addons))
	for _, addon := range addons {
		byID[addon.ID] = addon
	}

	result := make([]QuoteAddon, 0, len(selections))
	var total int64
	for _, sel := range selections {
		addon, ok := byID[sel.ID]
		if !ok {
			return nil, 0, utils.BadRequest("Add-on tidak tersedia untuk paket ini.")
		}
		qty := sel.Quantity
		if qty == 0 {
			qty = 1
		}
		if addon.PricingType == "per_person" && qty > travelers {
			return nil, 0, utils.BadRequest("Jumlah add-on per peserta tidak boleh melebihi jumlah peserta.")
		}
		lineTotal := addon.Price * int64(qty)
		total += lineTotal
		result = append(result, QuoteAddon{
			ID:          addon.ID,
			Name:        addon.Name,
			Description: addon.Description,
			UnitPrice:   addon.Price,
			Quantity:    qty,
			Total:       lineTotal,
			PricingType: addon.PricingType,
		})
	}
	return result, total, nil
}

func (s *BookingService) calculateCoupon(db *gorm.DB, code string, subtotal int64) (int64, *QuoteCoupon, error) {
	if code == "" {
		return 0, nil, nil
	}
	code = strings.ToUpper(code)
	var coupon models.Coupon
	if err := db.Where("code = ?", code).First(&coupon).Error; err != nil {
		return 0, nil, utils.BadRequest("Kode promo tidak ditemukan.")
	}
	discount, err := evaluateCoupon(&coupon, subtotal, time.Now())
	if err != nil {
		return 0, nil, err
	}
	return discount, &QuoteCoupon{
		Code:        coupon.Code,
		Type:        coupon.Type,
		Value:       coupon.Value,
		Description: coupon.Description,
	}, nil
}

// evaluateCoupon applies the coupon rules to a subtotal. It is kept free of
// database access so the pricing rules can be unit tested in isolation.
func evaluateCoupon(coupon *models.Coupon, subtotal int64, now time.Time) (int64, error) {
	if !coupon.Active {
		return 0, utils.BadRequest("Kode promo sudah tidak aktif.")
	}
	if coupon.StartsAt != nil && now.Before(*coupon.StartsAt) {
		return 0, utils.BadRequest("Kode promo belum berlaku.")
	}
	if coupon.EndsAt != nil && now.After(*coupon.EndsAt) {
		return 0, utils.BadRequest("Kode promo sudah kedaluwarsa.")
	}
	if coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit {
		return 0, utils.BadRequest("Kuota penggunaan kode promo sudah habis.")
	}
	if coupon.MinSpend > 0 && subtotal < coupon.MinSpend {
		return 0, utils.BadRequest("Minimal transaksi untuk kode promo ini belum terpenuhi.")
	}

	var discount int64
	switch coupon.Type {
	case "fixed":
		discount = coupon.Value
	case "percent":
		discount = utils.RoundIDR(float64(subtotal) * float64(coupon.Value) / 100)
		if coupon.MaxDiscount > 0 && discount > coupon.MaxDiscount {
			discount = coupon.MaxDiscount
		}
	default:
		return 0, utils.BadRequest("Tipe kode promo tidak didukung.")
	}
	if discount > subtotal {
		discount = subtotal
	}
	if discount < 0 {
		discount = 0
	}
	return discount, nil
}

func calculateTax(base int64) int64 {
	if config.App.TaxPercent <= 0 || base <= 0 {
		return 0
	}
	return utils.RoundIDR(float64(base) * config.App.TaxPercent / 100)
}

// Create books a departure atomically. The departure row is locked, quota is
// validated and reserved inside the same transaction, and the idempotency key
// makes retries safe.
func (s *BookingService) Create(userID uint, input CreateBookingInput, idempotencyKey string) (*models.Booking, error) {
	if !input.Consent {
		return nil, utils.BadRequest("Anda harus menyetujui syarat, kebijakan pembatalan, dan kebijakan privasi.")
	}
	if len(input.Travelers) < 1 {
		return nil, utils.BadRequest("Data peserta wajib diisi minimal satu orang.")
	}
	if len(input.Travelers) > 30 {
		return nil, utils.BadRequest("Jumlah peserta maksimal 30 orang per booking.")
	}

	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, utils.NotFound("Pengguna tidak ditemukan.")
	}
	if user.EmailVerifiedAt == nil {
		return nil, utils.Forbidden("Verifikasi email Anda terlebih dahulu sebelum membuat pesanan.")
	}

	idempotencyKey = strings.TrimSpace(idempotencyKey)
	if idempotencyKey != "" {
		var existing models.Booking
		if err := s.db.Where("idempotency_key = ? AND user_id = ?", idempotencyKey, userID).First(&existing).Error; err == nil {
			return s.LoadBookingByCode(existing.BookingCode, userID, false)
		}
	}

	var booking *models.Booking
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var dep models.PackageDeparture
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Preload("Package").First(&dep, input.DepartureID).Error; err != nil {
			return utils.NotFound("Jadwal keberangkatan tidak ditemukan.")
		}
		if err := validateDepartureAvailability(dep, len(input.Travelers)); err != nil {
			return err
		}

		quote, err := s.quoteWithDB(tx, QuoteInput{
			DepartureID: input.DepartureID,
			Travelers:   input.Travelers,
			Addons:      input.Addons,
			CouponCode:  input.CouponCode,
		})
		if err != nil {
			return err
		}

		// Conditional update guards against overbooking even if a concurrent
		// transaction slipped past the row lock (e.g. different isolation mode).
		res := tx.Model(&models.PackageDeparture{}).
			Where("id = ? AND reserved_count + ? <= capacity AND status = ?", dep.ID, len(input.Travelers), "open").
			Update("reserved_count", gorm.Expr("reserved_count + ?", len(input.Travelers)))
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return utils.Conflict("Kuota tidak cukup. Silakan pilih jadwal atau jumlah peserta lain.")
		}

		if quote.Coupon != nil {
			res := tx.Model(&models.Coupon{}).
				Where("code = ? AND (usage_limit = 0 OR used_count < usage_limit)", quote.Coupon.Code).
				Update("used_count", gorm.Expr("used_count + 1"))
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return utils.Conflict("Kuota kode promo sudah habis.")
			}
		}

		code, err := uniqueBookingCode(tx)
		if err != nil {
			return err
		}
		now := time.Now()
		expires := now.Add(time.Duration(config.App.HoldMinutes) * time.Minute)
		organizerName := strings.TrimSpace(input.OrganizerName)
		if organizerName == "" {
			organizerName = user.Name
		}
		organizerPhone := strings.TrimSpace(input.OrganizerPhone)
		if organizerPhone == "" {
			organizerPhone = user.Phone
		}
		organizerEmail := strings.TrimSpace(input.OrganizerEmail)
		if organizerEmail == "" {
			organizerEmail = user.Email
		}
		if organizerName == "" || organizerPhone == "" {
			return utils.BadRequest("Nama dan nomor WhatsApp pemesan wajib diisi.")
		}

		var keyPtr *string
		if idempotencyKey != "" {
			keyPtr = &idempotencyKey
		}

		booking = &models.Booking{
			BookingCode:       code,
			UserID:            userID,
			DepartureID:       dep.ID,
			Status:            models.BookingPendingPayment,
			Subtotal:          quote.Subtotal,
			Discount:          quote.Discount,
			Tax:               quote.Tax,
			Total:             quote.Total,
			Currency:          "IDR",
			NumberOfTravelers: len(input.Travelers),
			OrganizerName:     organizerName,
			OrganizerPhone:    organizerPhone,
			OrganizerEmail:    organizerEmail,
			Notes:             strings.TrimSpace(input.Notes),
			CouponCode:        couponCode(quote),
			ExpiresAt:         &expires,
			ConsentAt:         &now,
			IdempotencyKey:    keyPtr,
		}
		if err := tx.Create(booking).Error; err != nil {
			return err
		}

		items := []models.BookingItem{{
			BookingID:    booking.ID,
			Type:         "package",
			ReferenceID:  dep.PackageID,
			NameSnapshot: dep.Package.Title,
			UnitPrice:    quote.PricePerPerson,
			Quantity:     len(input.Travelers),
			Total:        quote.PricePerPerson * int64(len(input.Travelers)),
		}}
		for _, addon := range quote.Addons {
			items = append(items, models.BookingItem{
				BookingID:    booking.ID,
				Type:         "addon",
				ReferenceID:  addon.ID,
				NameSnapshot: addon.Name,
				UnitPrice:    addon.UnitPrice,
				Quantity:     addon.Quantity,
				Total:        addon.Total,
			})
		}
		if err := tx.Create(&items).Error; err != nil {
			return err
		}

		travelers := make([]models.BookingTraveler, 0, len(input.Travelers))
		for i, t := range input.Travelers {
			name := strings.TrimSpace(t.Name)
			if name == "" {
				return utils.BadRequest(fmt.Sprintf("Nama peserta %d wajib diisi.", i+1))
			}
			travelers = append(travelers, models.BookingTraveler{
				BookingID:             booking.ID,
				Name:                  name,
				BirthDate:             t.BirthDate,
				Gender:                strings.TrimSpace(t.Gender),
				Nationality:           strings.TrimSpace(t.Nationality),
				IDNumber:              strings.TrimSpace(t.IDNumber),
				EmergencyContactName:  strings.TrimSpace(t.EmergencyContactName),
				EmergencyContactPhone: strings.TrimSpace(t.EmergencyContactPhone),
				HealthNote:            strings.TrimSpace(t.HealthNote),
				HealthConsent:         t.HealthConsent,
				IsOrganizer:           i == 0 || t.IsOrganizer,
			})
		}
		if err := tx.Create(&travelers).Error; err != nil {
			return err
		}

		history := models.BookingStatusHistory{
			BookingID:     booking.ID,
			FromStatus:    "",
			ToStatus:      models.BookingPendingPayment,
			ChangedBy:     &userID,
			ChangedByName: user.Name,
			Reason:        "Booking dibuat, kuota ditahan sementara.",
		}
		return tx.Create(&history).Error
	})
	if err != nil {
		return nil, err
	}

	loaded, err := s.LoadBookingByCode(booking.BookingCode, userID, false)
	if err != nil {
		return nil, err
	}
	_ = s.email.SendBookingNotification(loaded, "booking_created")
	return loaded, nil
}

func couponCode(q *Quote) string {
	if q.Coupon == nil {
		return ""
	}
	return q.Coupon.Code
}

func uniqueBookingCode(db *gorm.DB) (string, error) {
	for attempt := 0; attempt < 5; attempt++ {
		b := make([]byte, 4)
		if _, err := rand.Read(b); err != nil {
			return "", err
		}
		code := fmt.Sprintf("RNJ-%s-%s", time.Now().Format("20060102"), strings.ToUpper(hexString(b)))
		var count int64
		if err := db.Model(&models.Booking{}).Where("booking_code = ?", code).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return code, nil
		}
	}
	return "", errors.New("failed to generate unique booking code")
}

func hexString(b []byte) string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	out := make([]byte, len(b))
	for i, v := range b {
		out[i] = chars[int(v)%len(chars)]
	}
	return string(out)
}

func (s *BookingService) LoadBookingByCode(code string, userID uint, admin bool) (*models.Booking, error) {
	var booking models.Booking
	query := s.db.
		Preload("User").
		Preload("Departure").
		Preload("Departure.Package").
		Preload("Items").
		Preload("Travelers").
		Preload("Payments").
		Preload("StatusHistory").
		Preload("Review").
		Where("booking_code = ?", strings.TrimSpace(code))
	if !admin && userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&booking).Error; err != nil {
		return nil, utils.NotFound("Pesanan tidak ditemukan.")
	}
	return &booking, nil
}

func (s *BookingService) ListUserBookings(userID uint, page, pageSize int) ([]models.Booking, int64, error) {
	var total int64
	query := s.db.Model(&models.Booking{}).Where("user_id = ?", userID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var bookings []models.Booking
	if err := query.
		Preload("Departure").
		Preload("Departure.Package").
		Preload("Payments").
		Preload("Review").
		Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&bookings).Error; err != nil {
		return nil, 0, err
	}
	return bookings, total, nil
}

// AdminBookingsFilter describes the admin booking list filters.
type AdminBookingsFilter struct {
	Search    string
	Status    string
	PackageID uint
	DateFrom  string
	DateTo    string
	Page      int
	PageSize  int
}

func (s *BookingService) AdminListBookings(filter AdminBookingsFilter) ([]models.Booking, int64, error) {
	query := s.db.Model(&models.Booking{}).
		Joins("LEFT JOIN package_departures ON package_departures.id = bookings.departure_id").
		Joins("LEFT JOIN packages ON packages.id = package_departures.package_id")

	if filter.Search != "" {
		like := "%" + strings.TrimSpace(filter.Search) + "%"
		query = query.Where("bookings.booking_code LIKE ? OR bookings.organizer_name LIKE ? OR bookings.organizer_email LIKE ? OR bookings.organizer_phone LIKE ?",
			like, like, like, like)
	}
	if filter.Status != "" {
		query = query.Where("bookings.status = ?", filter.Status)
	}
	if filter.PackageID > 0 {
		query = query.Where("package_departures.package_id = ?", filter.PackageID)
	}
	if filter.DateFrom != "" {
		query = query.Where("bookings.created_at >= ?", filter.DateFrom+" 00:00:00")
	}
	if filter.DateTo != "" {
		query = query.Where("bookings.created_at <= ?", filter.DateTo+" 23:59:59")
	}

	var total int64
	// The joins are one-to-one with bookings, so a plain count is accurate and
	// avoids MySQL's restriction on DISTINCT with ORDER BY columns.
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var bookings []models.Booking
	if err := query.
		Preload("User").
		Preload("Departure").
		Preload("Departure.Package").
		Preload("Payments").
		Order("bookings.created_at DESC").
		Offset((filter.Page - 1) * filter.PageSize).
		Limit(filter.PageSize).
		Find(&bookings).Error; err != nil {
		return nil, 0, err
	}
	return bookings, total, nil
}

func (s *BookingService) ExportBookingsCSV(filter AdminBookingsFilter) ([][]string, error) {
	filter.Page = 1
	filter.PageSize = 10000
	bookings, _, err := s.AdminListBookings(filter)
	if err != nil {
		return nil, err
	}
	rows := [][]string{{"Kode Booking", "Status", "Paket", "Keberangkatan", "Pemesan", "Email", "WhatsApp", "Peserta", "Total", "Dibuat"}}
	for _, b := range bookings {
		pkgTitle := ""
		start := ""
		if b.Departure != nil {
			start = b.Departure.StartDate.String()
			if b.Departure.Package != nil {
				pkgTitle = b.Departure.Package.Title
			}
		}
		rows = append(rows, []string{
			b.BookingCode, b.Status, pkgTitle, start, b.OrganizerName, b.OrganizerEmail, b.OrganizerPhone,
			fmt.Sprintf("%d", b.NumberOfTravelers), fmt.Sprintf("%d", b.Total), b.CreatedAt.Format("2006-01-02 15:04"),
		})
	}
	return rows, nil
}

// Transition applies a validated booking state transition and records history.
func (s *BookingService) Transition(bookingID uint, to, actorName, reason string, actorID *uint) (*models.Booking, error) {
	var booking models.Booking
	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&booking, bookingID).Error; err != nil {
			return utils.NotFound("Pesanan tidak ditemukan.")
		}
		return applyTransition(tx, &booking, to, actorName, reason, actorID)
	})
	if err != nil {
		return nil, err
	}
	loaded, err := s.LoadBookingByCode(booking.BookingCode, 0, true)
	if err != nil {
		return nil, err
	}
	_ = s.email.SendBookingNotification(loaded, notificationKindForStatus(to))
	return loaded, nil
}

func applyTransition(tx *gorm.DB, booking *models.Booking, to, actorName, reason string, actorID *uint) error {
	from := booking.Status
	if from == to {
		return nil
	}
	if !AllowedTransition(from, to) {
		return utils.Conflict(fmt.Sprintf("Perubahan status dari %s ke %s tidak diizinkan.", from, to))
	}
	now := time.Now()
	updates := map[string]interface{}{"status": to}
	switch to {
	case models.BookingConfirmed:
		updates["confirmed_at"] = &now
	case models.BookingCompleted:
		updates["completed_at"] = &now
	case models.BookingCancelled, models.BookingPaymentExpired:
		updates["cancelled_at"] = &now
		updates["cancellation_reason"] = reason
	}

	if releasesQuota(from, to) {
		if err := tx.Model(&models.PackageDeparture{}).
			Where("id = ?", booking.DepartureID).
			Update("reserved_count", gorm.Expr("GREATEST(reserved_count - ?, 0)", booking.NumberOfTravelers)).Error; err != nil {
			return err
		}
		if booking.CouponCode != "" {
			if err := tx.Model(&models.Coupon{}).
				Where("code = ? AND used_count > 0", booking.CouponCode).
				Update("used_count", gorm.Expr("used_count - 1")).Error; err != nil {
				return err
			}
		}
	}
	if to == models.BookingPaymentExpired || to == models.BookingCancelled {
		if err := tx.Model(&models.Payment{}).
			Where("booking_id = ? AND status = ?", booking.ID, models.PaymentPending).
			Update("status", models.PaymentExpired).Error; err != nil {
			return err
		}
	}

	if err := tx.Model(booking).Updates(updates).Error; err != nil {
		return err
	}
	booking.Status = to
	history := models.BookingStatusHistory{
		BookingID:     booking.ID,
		FromStatus:    from,
		ToStatus:      to,
		ChangedBy:     actorID,
		ChangedByName: actorName,
		Reason:        reason,
	}
	return tx.Create(&history).Error
}

func releasesQuota(from, to string) bool {
	if to != models.BookingCancelled && to != models.BookingPaymentExpired {
		return false
	}
	return from == models.BookingDraft || from == models.BookingPendingPayment || from == models.BookingOnHold
}

var allowedTransitions = map[string]map[string]bool{
	models.BookingDraft: {
		models.BookingPendingPayment: true,
		models.BookingCancelled:      true,
	},
	models.BookingPendingPayment: {
		models.BookingPaid:           true,
		models.BookingPaymentExpired: true,
		models.BookingCancelled:      true,
	},
	models.BookingPaid: {
		models.BookingConfirmed: true,
		models.BookingRefunded:  true,
		models.BookingCancelled: true,
	},
	models.BookingConfirmed: {
		models.BookingCompleted: true,
		models.BookingCancelled: true,
		models.BookingRefunded:  true,
	},
	models.BookingCompleted: {
		models.BookingRefunded: true,
	},
	models.BookingPaymentExpired: {
		models.BookingCancelled: true,
	},
	models.BookingCancelled: {
		models.BookingRefunded: true,
	},
	models.BookingOnHold: {
		models.BookingPendingPayment: true,
		models.BookingCancelled:      true,
	},
}

func AllowedTransition(from, to string) bool {
	next, ok := allowedTransitions[from]
	if !ok {
		return false
	}
	return next[to]
}

func notificationKindForStatus(status string) string {
	switch status {
	case models.BookingPaid, models.BookingConfirmed:
		return "payment_paid"
	case models.BookingCancelled, models.BookingPaymentExpired:
		return "booking_cancelled"
	case models.BookingCompleted:
		return "booking_completed"
	default:
		return "status_update"
	}
}

// CancelByCustomer allows self-service cancellation only while payment is pending.
func (s *BookingService) CancelByCustomer(code string, userID uint, reason string) (*models.Booking, error) {
	booking, err := s.LoadBookingByCode(code, userID, false)
	if err != nil {
		return nil, err
	}
	if booking.Status != models.BookingPendingPayment && booking.Status != models.BookingDraft {
		return nil, utils.Conflict("Pesanan ini tidak dapat dibatalkan sendiri. Hubungi tim dukungan kami.")
	}
	if strings.TrimSpace(reason) == "" {
		reason = "Dibatalkan oleh pelanggan."
	}
	return s.Transition(booking.ID, models.BookingCancelled, booking.OrganizerName, reason, &userID)
}

// ExpireHolds releases quota for unpaid bookings past their expiry.
func (s *BookingService) ExpireHolds() (int, error) {
	var expired []models.Booking
	if err := s.db.Where("status = ? AND expires_at IS NOT NULL AND expires_at < ?", models.BookingPendingPayment, time.Now()).
		Limit(200).Find(&expired).Error; err != nil {
		return 0, err
	}
	count := 0
	for _, candidate := range expired {
		err := s.db.Transaction(func(tx *gorm.DB) error {
			var booking models.Booking
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&booking, candidate.ID).Error; err != nil {
				return err
			}
			if booking.Status != models.BookingPendingPayment {
				return nil
			}
			if booking.ExpiresAt == nil || booking.ExpiresAt.After(time.Now()) {
				return nil
			}
			return applyTransition(tx, &booking, models.BookingPaymentExpired, "system", "Batas waktu pembayaran terlewat.", nil)
		})
		if err != nil {
			return count, err
		}
		count++
	}
	return count, nil
}

func (s *BookingService) AddReview(userID uint, code string, rating int, title, content string) (*models.Review, error) {
	if rating < 1 || rating > 5 {
		return nil, utils.BadRequest("Rating harus antara 1 sampai 5.")
	}
	booking, err := s.LoadBookingByCode(code, userID, false)
	if err != nil {
		return nil, err
	}
	if booking.Status != models.BookingCompleted {
		return nil, utils.Forbidden("Ulasan hanya dapat dibuat setelah perjalanan selesai.")
	}
	var existing models.Review
	if err := s.db.Where("booking_id = ?", booking.ID).First(&existing).Error; err == nil {
		return nil, utils.Conflict("Anda sudah mengirim ulasan untuk pesanan ini.")
	}
	review := models.Review{
		BookingID: booking.ID,
		PackageID: booking.Departure.PackageID,
		UserID:    userID,
		Rating:    rating,
		Title:     strings.TrimSpace(title),
		Content:   strings.TrimSpace(content),
		Status:    "pending",
	}
	if err := s.db.Create(&review).Error; err != nil {
		return nil, err
	}
	return &review, nil
}

func (s *BookingService) ModerateReview(reviewID uint, status, note string) (*models.Review, error) {
	if status != "published" && status != "rejected" && status != "pending" {
		return nil, utils.BadRequest("Status ulasan tidak valid.")
	}
	var review models.Review
	if err := s.db.First(&review, reviewID).Error; err != nil {
		return nil, utils.NotFound("Ulasan tidak ditemukan.")
	}
	updates := map[string]interface{}{"status": status, "admin_note": note}
	if status == "published" {
		now := time.Now()
		updates["published_at"] = &now
	} else {
		updates["published_at"] = nil
	}
	if err := s.db.Model(&review).Updates(updates).Error; err != nil {
		return nil, err
	}
	if err := recomputePackageRating(s.db, review.PackageID); err != nil {
		return nil, err
	}
	return &review, nil
}

func recomputePackageRating(db *gorm.DB, packageID uint) error {
	var avg struct {
		Average float64
		Count   int
	}
	if err := db.Model(&models.Review{}).
		Select("COALESCE(AVG(rating), 0) as average, COUNT(*) as count").
		Where("package_id = ? AND status = ?", packageID, "published").
		Scan(&avg).Error; err != nil {
		return err
	}
	return db.Model(&models.Package{}).Where("id = ?", packageID).Updates(map[string]interface{}{
		"rating":       math.Round(avg.Average*100) / 100,
		"review_count": avg.Count,
	}).Error
}
