package services

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/utils"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// PaymentGateway abstracts a payment provider. The mock adapter implements the
// same contract that a real Indonesian gateway adapter would use.
type PaymentGateway interface {
	Name() string
	CreatePayment(booking *models.Booking) (*models.Payment, error)
	VerifyWebhook(payload []byte, signature string) error
}

type MockGateway struct {
	secret   string
	baseURL  string
	frontend string
}

func NewMockGateway() *MockGateway {
	return &MockGateway{
		secret:   config.App.PaymentSecret,
		baseURL:  config.App.APIBaseURL,
		frontend: config.App.FrontendURL,
	}
}

func (g *MockGateway) Name() string { return "mock" }

func (g *MockGateway) CreatePayment(booking *models.Booking) (*models.Payment, error) {
	ref := fmt.Sprintf("MOCK-%s-%d", booking.BookingCode, time.Now().Unix())
	expires := time.Now().Add(30 * time.Minute)
	va := "8808" + fmt.Sprintf("%010d", int64(booking.ID)*7919+time.Now().Unix()%100000)
	return &models.Payment{
		BookingID:         booking.ID,
		Provider:          g.Name(),
		ProviderReference: ref,
		Amount:            booking.Total,
		Currency:          booking.Currency,
		Status:            models.PaymentPending,
		Method:            "va",
		VirtualAccount:    va,
		PaymentURL:        fmt.Sprintf("%s/payment/simulate?ref=%s", g.frontend, ref),
		ExpiresAt:         &expires,
	}, nil
}

func (g *MockGateway) VerifyWebhook(payload []byte, signature string) error {
	expected := SignPayload(payload, g.secret)
	if !hmac.Equal([]byte(strings.TrimSpace(signature)), []byte(expected)) {
		return utils.Unauthorized("Signature webhook tidak valid.")
	}
	return nil
}

func SignPayload(payload []byte, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	return hex.EncodeToString(mac.Sum(nil))
}

type PaymentService struct {
	db      *gorm.DB
	gateway PaymentGateway
	email   *EmailService
}

func NewPaymentService(db *gorm.DB, gateway PaymentGateway, email *EmailService) *PaymentService {
	return &PaymentService{db: db, gateway: gateway, email: email}
}

// CreatePayment creates (or reuses) a pending payment intent for a booking.
func (s *PaymentService) CreatePayment(bookingCode string, userID uint, admin bool, method string) (*models.Payment, error) {
	var booking models.Booking
	query := s.db.Where("booking_code = ?", bookingCode)
	if !admin && userID > 0 {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.First(&booking).Error; err != nil {
		return nil, utils.NotFound("Pesanan tidak ditemukan.")
	}
	if booking.Status != models.BookingPendingPayment {
		return nil, utils.Conflict("Pesanan ini tidak dalam status menunggu pembayaran.")
	}
	if booking.ExpiresAt != nil && booking.ExpiresAt.Before(time.Now()) {
		return nil, utils.Conflict("Batas waktu pembayaran sudah lewat. Silakan buat pesanan baru.")
	}

	var existing models.Payment
	if err := s.db.Where("booking_id = ? AND status = ?", booking.ID, models.PaymentPending).Order("id DESC").First(&existing).Error; err == nil {
		return &existing, nil
	}

	payment, err := s.gateway.CreatePayment(&booking)
	if err != nil {
		return nil, err
	}
	if method != "" {
		payment.Method = method
	}
	if err := s.db.Create(payment).Error; err != nil {
		return nil, err
	}
	return payment, nil
}

type WebhookEvent struct {
	EventID           string `json:"event_id"`
	Type              string `json:"type"`
	ProviderReference string `json:"provider_reference"`
	BookingCode       string `json:"booking_code"`
	Amount            int64  `json:"amount"`
	Currency          string `json:"currency"`
	Method            string `json:"method"`
	PaidAt            string `json:"paid_at"`
}

// HandleWebhook verifies, records, and processes a payment webhook idempotently.
func (s *PaymentService) HandleWebhook(provider string, payload []byte, signature string) (*models.PaymentEvent, error) {
	if provider != s.gateway.Name() && provider != "" {
		return nil, utils.BadRequest("Provider pembayaran tidak dikenal.")
	}
	signatureValid := s.gateway.VerifyWebhook(payload, signature) == nil
	var event WebhookEvent
	if err := json.Unmarshal(payload, &event); err != nil {
		return nil, utils.BadRequest("Payload webhook tidak valid.")
	}
	if event.EventID == "" {
		return nil, utils.BadRequest("event_id wajib diisi.")
	}

	record := models.PaymentEvent{
		Provider:         provider,
		EventID:          event.EventID,
		BookingCode:      event.BookingCode,
		PaymentReference: event.ProviderReference,
		SignatureValid:   signatureValid,
		Payload:          string(payload),
		Processed:        false,
	}
	if err := s.db.Create(&record).Error; err != nil {
		// A duplicate event is acknowledged and not processed again.
		var existing models.PaymentEvent
		if err2 := s.db.Where("event_id = ?", event.EventID).First(&existing).Error; err2 == nil {
			return &existing, nil
		}
		return nil, err
	}
	if !signatureValid {
		record.ErrorMessage = "invalid signature"
		_ = s.db.Save(&record).Error
		return nil, utils.Unauthorized("Signature webhook tidak valid.")
	}
	if event.Type != "payment.paid" && event.Type != "payment.settled" {
		record.ErrorMessage = "unsupported event type"
		_ = s.db.Save(&record).Error
		return &record, nil
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var payment models.Payment
		query := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("provider_reference = ?", event.ProviderReference)
		if event.BookingCode != "" {
			query = query.Or("booking_id = (SELECT id FROM bookings WHERE booking_code = ?)", event.BookingCode)
		}
		if err := query.First(&payment).Error; err != nil {
			return utils.NotFound("Pembayaran tidak ditemukan.")
		}
		if payment.Status == models.PaymentPaid {
			return nil // idempotent replay
		}
		if payment.Amount != event.Amount {
			return utils.Conflict("Nominal pembayaran tidak sesuai dengan invoice.")
		}
		if event.Currency != "" && !strings.EqualFold(event.Currency, payment.Currency) {
			return utils.Conflict("Mata uang pembayaran tidak sesuai.")
		}

		var booking models.Booking
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&booking, payment.BookingID).Error; err != nil {
			return utils.NotFound("Pesanan tidak ditemukan.")
		}
		if booking.Status != models.BookingPendingPayment && booking.Status != models.BookingPaid {
			return utils.Conflict("Pesanan tidak dapat dibayar pada status saat ini.")
		}
		if event.BookingCode != "" && event.BookingCode != booking.BookingCode {
			return utils.Conflict("Kode booking pada webhook tidak cocok.")
		}

		now := time.Now()
		paidAt := now
		if event.PaidAt != "" {
			if parsed, err := time.Parse(time.RFC3339, event.PaidAt); err == nil {
				paidAt = parsed
			}
		}
		if err := tx.Model(&payment).Updates(map[string]interface{}{
			"status":              models.PaymentPaid,
			"paid_at":             &paidAt,
			"raw_event_reference": event.EventID,
			"method":              event.Method,
		}).Error; err != nil {
			return err
		}
		if booking.Status == models.BookingPendingPayment {
			actorName := "payment-webhook"
			if err := applyTransition(tx, &booking, models.BookingPaid, actorName, "Pembayaran terverifikasi via webhook.", nil); err != nil {
				return err
			}
			booking.Status = models.BookingPaid
			if err := applyTransition(tx, &booking, models.BookingConfirmed, actorName, "Pesanan dikonfirmasi otomatis.", nil); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		record.ErrorMessage = err.Error()
		_ = s.db.Save(&record).Error
		return nil, err
	}
	record.Processed = true
	_ = s.db.Save(&record).Error

	var booking models.Booking
	if err := s.db.Preload("Departure").Preload("Departure.Package").Where("booking_code = ?", event.BookingCode).First(&booking).Error; err == nil {
		_ = s.email.SendBookingNotification(&booking, "payment_paid")
	}
	return &record, nil
}

// Refund marks a payment as refunded. In production this would call the
// gateway refund API and store the provider refund reference.
func (s *PaymentService) Refund(paymentID uint, actorName, reason string) (*models.Payment, error) {
	var payment models.Payment
	if err := s.db.First(&payment, paymentID).Error; err != nil {
		return nil, utils.NotFound("Pembayaran tidak ditemukan.")
	}
	if payment.Status != models.PaymentPaid {
		return nil, utils.Conflict("Hanya pembayaran yang sudah lunas yang dapat direfund.")
	}
	if err := s.db.Model(&payment).Update("status", models.PaymentRefunded).Error; err != nil {
		return nil, err
	}
	booking, err := s.LoadBookingByCodeByID(payment.BookingID)
	if err == nil && (booking.Status == models.BookingPaid || booking.Status == models.BookingConfirmed || booking.Status == models.BookingCancelled) {
		actor := actorName
		_, _ = s.transitionByID(booking.ID, models.BookingRefunded, actor, reason)
	}
	return &payment, nil
}

func (s *PaymentService) transitionByID(id uint, to, actorName, reason string) (*models.Booking, error) {
	bs := NewBookingService(s.db, s.email)
	return bs.Transition(id, to, actorName, reason, nil)
}

func (s *PaymentService) LoadBookingByCodeByID(id uint) (*models.Booking, error) {
	var booking models.Booking
	if err := s.db.Preload("Departure").Preload("Departure.Package").First(&booking, id).Error; err != nil {
		return nil, err
	}
	return &booking, nil
}

// SimulatePaid is only used by the development mock payment page. It builds a
// signed webhook payload and runs it through the exact same processing path.
func (s *PaymentService) SimulatePaid(providerReference string) (*models.PaymentEvent, error) {
	if config.IsProduction() {
		return nil, utils.Forbidden("Simulasi pembayaran tidak tersedia di produksi.")
	}
	var payment models.Payment
	if err := s.db.Preload("Booking").Where("provider_reference = ?", providerReference).First(&payment).Error; err != nil {
		return nil, utils.NotFound("Pembayaran tidak ditemukan.")
	}
	if payment.Booking == nil {
		return nil, utils.NotFound("Pesanan tidak ditemukan.")
	}
	event := WebhookEvent{
		EventID:           fmt.Sprintf("evt-sim-%d", time.Now().UnixNano()),
		Type:              "payment.paid",
		ProviderReference: payment.ProviderReference,
		BookingCode:       payment.Booking.BookingCode,
		Amount:            payment.Amount,
		Currency:          payment.Currency,
		Method:            payment.Method,
		PaidAt:            time.Now().Format(time.RFC3339),
	}
	payload, _ := json.Marshal(event)
	signature := SignPayload(payload, config.App.PaymentSecret)
	return s.HandleWebhook(s.gateway.Name(), payload, signature)
}
