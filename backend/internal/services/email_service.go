package services

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/models"

	"gorm.io/gorm"
)

// EmailService sends transactional email. When SMTP is not configured it
// falls back to structured logging, which is useful in local development.
type EmailService struct {
	db *gorm.DB
}

func NewEmailService(db *gorm.DB) *EmailService {
	return &EmailService{db: db}
}

func (s *EmailService) Send(to, subject, body string) error {
	return s.send(to, subject, body, nil)
}

func (s *EmailService) send(to, subject, body string, bookingID *uint) error {
	status := "sent"
	var sendErr error

	if config.App.SMTPHost != "" && config.App.SMTPUser != "" {
		auth := smtp.PlainAuth("", config.App.SMTPUser, config.App.SMTPPassword, config.App.SMTPHost)
		addr := fmt.Sprintf("%s:%d", config.App.SMTPHost, config.App.SMTPPort)
		msg := []byte("From: " + config.App.EmailFrom + "\r\n" +
			"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/html; charset=UTF-8\r\n\r\n" +
			body + "\r\n")
		sendErr = smtp.SendMail(addr, auth, config.App.EmailFrom, []string{to}, msg)
		if sendErr != nil {
			status = "failed"
		}
	}

	if sendErr != nil || config.App.SMTPHost == "" {
		log.Printf("[EMAIL] to=%s subject=%q status=%s body=%s", to, subject, status, stripHTML(body))
	}

	notification := models.Notification{
		BookingID: bookingID,
		Type:      "email",
		Recipient: to,
		Subject:   subject,
		Body:      body,
		Status:    status,
		SentAt:    timePtr(time.Now()),
	}
	if s.db != nil {
		if err := s.db.Create(&notification).Error; err != nil {
			log.Printf("failed to persist notification: %v", err)
		}
	}
	return sendErr
}

// SendBookingNotification renders a simple transactional message for a booking.
func (s *EmailService) SendBookingNotification(booking *models.Booking, kind string) error {
	if booking.OrganizerEmail == "" {
		return nil
	}
	subject := ""
	body := ""
	switch kind {
	case "booking_created":
		subject = "Invoice " + booking.BookingCode + " - " + config.App.BusinessName
		body = bookingEmailBody(booking, "Terima kasih, pesanan Anda sudah kami terima.",
			"Selesaikan pembayaran sebelum batas waktu agar kuota keberangkatan tetap terkunci untuk Anda.")
	case "payment_paid":
		subject = "Pembayaran diterima - " + booking.BookingCode
		body = bookingEmailBody(booking, "Pembayaran Anda telah terverifikasi.",
			"Voucher perjalanan Anda sudah aktif. Tunjukkan kode booking saat tiba di titik keberangkatan.")
	case "booking_cancelled":
		subject = "Pesanan dibatalkan - " + booking.BookingCode
		body = bookingEmailBody(booking, "Pesanan Anda telah dibatalkan.",
			"Jika pembatalan ini tidak Anda harapkan, hubungi tim kami secepatnya.")
	case "booking_completed":
		subject = "Terima kasih telah trekking bersama kami - " + booking.BookingCode
		body = bookingEmailBody(booking, "Perjalanan Anda telah selesai.",
			"Kami senang bisa menemani perjalanan Anda. Silakan bagikan ulasan di dashboard akun.")
	default:
		subject = "Update pesanan " + booking.BookingCode
		body = bookingEmailBody(booking, "Status pesanan Anda diperbarui.", "")
	}

	body += footer()
	bookingID := booking.ID
	return s.send(booking.OrganizerEmail, subject, body, &bookingID)
}

func bookingEmailBody(booking *models.Booking, headline, note string) string {
	return fmt.Sprintf(`
<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#222831">
  <h2 style="color:#00ADB5">%s</h2>
  <p>%s</p>
  <table style="width:100%%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:6px 0">Kode booking</td><td><strong>%s</strong></td></tr>
    <tr><td style="padding:6px 0">Status</td><td>%s</td></tr>
    <tr><td style="padding:6px 0">Jumlah peserta</td><td>%d</td></tr>
    <tr><td style="padding:6px 0">Total</td><td><strong>IDR %s</strong></td></tr>
  </table>
  <p>%s</p>
</div>`, headline, note, booking.BookingCode, booking.Status, booking.NumberOfTravelers, formatIDR(booking.Total), "Kelola pesanan Anda melalui dashboard pelanggan.")
}

func footer() string {
	return fmt.Sprintf(`<p style="margin-top:24px;font-size:12px;color:#666">%s · %s · %s</p>`,
		config.App.BusinessName, config.App.BusinessEmail, config.App.BusinessPhone)
}

func formatIDR(value int64) string {
	s := fmt.Sprintf("%d", value)
	var out []byte
	for i, c := range []byte(s) {
		if i > 0 && (len(s)-i)%3 == 0 {
			out = append(out, '.')
		}
		out = append(out, c)
	}
	return string(out)
}

func stripHTML(value string) string {
	value = strings.ReplaceAll(value, "<br>", " ")
	value = strings.ReplaceAll(value, "<br/>", " ")
	for {
		start := strings.Index(value, "<")
		if start == -1 {
			break
		}
		end := strings.Index(value[start:], ">")
		if end == -1 {
			break
		}
		value = value[:start] + value[start+end+1:]
	}
	return strings.Join(strings.Fields(value), " ")
}

func timePtr(t time.Time) *time.Time { return &t }
