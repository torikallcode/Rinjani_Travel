package services

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"testing"
	"time"

	"rinjani-travel-backend/internal/config"
	"rinjani-travel-backend/internal/models"
)

func TestAllowedTransition(t *testing.T) {
	tests := []struct {
		name string
		from string
		to   string
		want bool
	}{
		{"draft to pending payment", models.BookingDraft, models.BookingPendingPayment, true},
		{"pending payment to paid", models.BookingPendingPayment, models.BookingPaid, true},
		{"pending payment to expired", models.BookingPendingPayment, models.BookingPaymentExpired, true},
		{"paid to confirmed", models.BookingPaid, models.BookingConfirmed, true},
		{"confirmed to completed", models.BookingConfirmed, models.BookingCompleted, true},
		{"completed to refunded", models.BookingCompleted, models.BookingRefunded, true},
		{"cancelled to refunded", models.BookingCancelled, models.BookingRefunded, true},
		{"paid back to pending payment", models.BookingPaid, models.BookingPendingPayment, false},
		{"completed back to confirmed", models.BookingCompleted, models.BookingConfirmed, false},
		{"refunded to anything", models.BookingRefunded, models.BookingConfirmed, false},
		{"unknown status", "unknown", models.BookingPaid, false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := AllowedTransition(test.from, test.to); got != test.want {
				t.Fatalf("AllowedTransition(%q, %q) = %v, want %v", test.from, test.to, got, test.want)
			}
		})
	}
}

func TestEvaluateCoupon(t *testing.T) {
	now := time.Date(2026, 10, 28, 10, 0, 0, 0, time.UTC)
	earlier := now.Add(-24 * time.Hour)
	later := now.Add(24 * time.Hour)

	tests := []struct {
		name      string
		coupon    models.Coupon
		subtotal  int64
		want      int64
		wantError bool
	}{
		{
			name:     "percent discount",
			coupon:   models.Coupon{Type: "percent", Value: 10, Active: true},
			subtotal: 1_000_000,
			want:     100_000,
		},
		{
			name:     "percent capped by max discount",
			coupon:   models.Coupon{Type: "percent", Value: 20, MaxDiscount: 50_000, Active: true},
			subtotal: 1_000_000,
			want:     50_000,
		},
		{
			name:     "fixed discount",
			coupon:   models.Coupon{Type: "fixed", Value: 250_000, Active: true},
			subtotal: 1_000_000,
			want:     250_000,
		},
		{
			name:     "fixed discount clamped to subtotal",
			coupon:   models.Coupon{Type: "fixed", Value: 2_000_000, Active: true},
			subtotal: 750_000,
			want:     750_000,
		},
		{
			name:     "minimum spend met",
			coupon:   models.Coupon{Type: "fixed", Value: 100_000, MinSpend: 500_000, Active: true},
			subtotal: 750_000,
			want:     100_000,
		},
		{
			name:      "inactive coupon",
			coupon:    models.Coupon{Type: "percent", Value: 10, Active: false},
			subtotal:  1_000_000,
			wantError: true,
		},
		{
			name:      "coupon not started",
			coupon:    models.Coupon{Type: "percent", Value: 10, Active: true, StartsAt: &later},
			subtotal:  1_000_000,
			wantError: true,
		},
		{
			name:      "coupon expired",
			coupon:    models.Coupon{Type: "percent", Value: 10, Active: true, EndsAt: &earlier},
			subtotal:  1_000_000,
			wantError: true,
		},
		{
			name:      "usage limit reached",
			coupon:    models.Coupon{Type: "percent", Value: 10, Active: true, UsageLimit: 5, UsedCount: 5},
			subtotal:  1_000_000,
			wantError: true,
		},
		{
			name:      "minimum spend not met",
			coupon:    models.Coupon{Type: "percent", Value: 10, Active: true, MinSpend: 2_000_000},
			subtotal:  1_000_000,
			wantError: true,
		},
		{
			name:      "unsupported coupon type",
			coupon:    models.Coupon{Type: "bogus", Value: 10, Active: true},
			subtotal:  1_000_000,
			wantError: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := evaluateCoupon(&test.coupon, test.subtotal, now)
			if test.wantError {
				if err == nil {
					t.Fatalf("expected an error, got discount %d", got)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != test.want {
				t.Fatalf("discount = %d, want %d", got, test.want)
			}
		})
	}
}

func TestSignPayloadMatchesHMAC(t *testing.T) {
	payload := []byte(`{"event_id":"evt-1","type":"payment.paid"}`)
	secret := "test-secret"

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	want := hex.EncodeToString(mac.Sum(nil))

	if got := SignPayload(payload, secret); got != want {
		t.Fatalf("SignPayload() = %s, want %s", got, want)
	}
}

func TestMockGatewayVerifyWebhook(t *testing.T) {
	config.App.PaymentSecret = "test-secret"
	gateway := NewMockGateway()
	payload := []byte(`{"event_id":"evt-1"}`)
	signature := SignPayload(payload, config.App.PaymentSecret)

	if err := gateway.VerifyWebhook(payload, signature); err != nil {
		t.Fatalf("expected valid signature to pass, got %v", err)
	}
	if err := gateway.VerifyWebhook(payload, "deadbeef"); err == nil {
		t.Fatal("expected invalid signature to fail")
	}
	if err := gateway.VerifyWebhook([]byte(`{"event_id":"evt-2"}`), signature); err == nil {
		t.Fatal("expected tampered payload to fail")
	}
}
