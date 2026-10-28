package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
)

// StringArray stores a JSON encoded array of strings in a text column.
// It keeps the API payload natural ([]string) while remaining portable.
type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	b, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = StringArray{}
		return nil
	}
	var raw []byte
	switch v := value.(type) {
	case []byte:
		raw = v
	case string:
		raw = []byte(v)
	default:
		return fmt.Errorf("unsupported type for StringArray: %T", value)
	}
	if len(strings.TrimSpace(string(raw))) == 0 {
		*s = StringArray{}
		return nil
	}
	return json.Unmarshal(raw, s)
}

// Date is a date-only value that serializes as YYYY-MM-DD.
type Date struct {
	time.Time
}

const dateLayout = "2006-01-02"

func NewDate(t time.Time) Date {
	return Date{Time: time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())}
}

func ParseDate(value string) (Date, error) {
	t, err := time.ParseInLocation(dateLayout, value, time.Local)
	if err != nil {
		return Date{}, err
	}
	return Date{Time: t}, nil
}

func (d Date) String() string {
	if d.Time.IsZero() {
		return ""
	}
	return d.Time.Format(dateLayout)
}

func (d Date) MarshalJSON() ([]byte, error) {
	if d.Time.IsZero() {
		return []byte("null"), nil
	}
	return json.Marshal(d.Time.Format(dateLayout))
}

func (d *Date) UnmarshalJSON(b []byte) error {
	if string(b) == "null" || string(b) == `""` {
		d.Time = time.Time{}
		return nil
	}
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	parsed, err := ParseDate(s)
	if err != nil {
		return err
	}
	*d = parsed
	return nil
}

func (d *Date) Scan(value interface{}) error {
	if value == nil {
		d.Time = time.Time{}
		return nil
	}
	switch v := value.(type) {
	case time.Time:
		d.Time = v
		return nil
	case []byte:
		return d.parseBytes(v)
	case string:
		return d.parseBytes([]byte(v))
	default:
		return fmt.Errorf("unsupported type for Date: %T", value)
	}
}

func (d *Date) parseBytes(raw []byte) error {
	s := strings.TrimSpace(string(raw))
	if s == "" || s == "0000-00-00" {
		d.Time = time.Time{}
		return nil
	}
	layouts := []string{dateLayout, "2006-01-02 15:04:05", time.RFC3339}
	for _, layout := range layouts {
		if t, err := time.ParseInLocation(layout, s, time.Local); err == nil {
			d.Time = t
			return nil
		}
	}
	return fmt.Errorf("cannot parse date %q", s)
}

func (d Date) Value() (driver.Value, error) {
	if d.Time.IsZero() {
		return nil, nil
	}
	return d.Time.Format(dateLayout), nil
}

func (d Date) AddDate(years, months, days int) Date {
	return Date{Time: d.Time.AddDate(years, months, days)}
}

// Role constants.
const (
	RoleCustomer     = "customer"
	RoleAdminOps     = "admin_ops"
	RoleAdminContent = "admin_content"
	RoleSuperAdmin   = "super_admin"
)

// Booking status constants.
const (
	BookingDraft          = "draft"
	BookingPendingPayment = "pending_payment"
	BookingPaid           = "paid"
	BookingConfirmed      = "confirmed"
	BookingCompleted      = "completed"
	BookingPaymentExpired = "payment_expired"
	BookingCancelled      = "cancelled"
	BookingRefunded       = "refunded"
	BookingOnHold         = "on_hold"
)

// Payment status constants.
const (
	PaymentPending  = "pending"
	PaymentPaid     = "paid"
	PaymentFailed   = "failed"
	PaymentExpired  = "expired"
	PaymentRefunded = "refunded"
)

type User struct {
	ID                    uint           `gorm:"primaryKey" json:"id"`
	Name                  string         `gorm:"size:100;not null" json:"name"`
	Email                 string         `gorm:"size:150;not null;uniqueIndex" json:"email"`
	Phone                 string         `gorm:"size:30;not null" json:"phone"`
	Country               string         `gorm:"size:80" json:"country"`
	PasswordHash          string         `gorm:"size:255;not null" json:"-"`
	Role                  string         `gorm:"size:30;default:'customer';index" json:"role"`
	EmailVerifiedAt       *time.Time     `json:"email_verified_at"`
	VerificationTokenHash string         `gorm:"size:64;index" json:"-"`
	ResetTokenHash        string         `gorm:"size:64;index" json:"-"`
	ResetExpiresAt        *time.Time     `json:"-"`
	EmergencyContactName  string         `gorm:"size:100" json:"emergency_contact_name"`
	EmergencyContactPhone string         `gorm:"size:30" json:"emergency_contact_phone"`
	IsActive              bool           `gorm:"default:true" json:"is_active"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u User) IsAdmin() bool {
	return u.Role == RoleAdminOps || u.Role == RoleAdminContent || u.Role == RoleSuperAdmin
}

type Package struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	Slug               string         `gorm:"size:220;not null;uniqueIndex" json:"slug"`
	Title              string         `gorm:"size:220;not null" json:"title"`
	Category           string         `gorm:"size:50;not null;index" json:"category"`
	Description        string         `gorm:"type:text;not null" json:"description"`
	DescriptionLong    string         `gorm:"type:text" json:"description_long"`
	Image              string         `gorm:"type:text" json:"image"`
	Gallery            StringArray    `gorm:"type:text" json:"gallery"`
	Difficulty         string         `gorm:"size:30;not null;index" json:"difficulty"`
	Duration           int            `json:"duration"`
	Days               int            `json:"days"`
	Rating             float64        `gorm:"type:decimal(3,2);default:0" json:"rating"`
	ReviewCount        int            `gorm:"default:0" json:"review_count"`
	BasePrice          int64          `gorm:"not null" json:"base_price"`
	Currency           string         `gorm:"size:3;default:'IDR'" json:"currency"`
	Status             string         `gorm:"size:20;default:'draft';index" json:"status"`
	DeparturePoint     string         `gorm:"size:120" json:"departure_point"`
	MinAge             int            `json:"min_age"`
	MaxAge             int            `json:"max_age"`
	Includes           StringArray    `gorm:"type:text" json:"includes"`
	Excludes           StringArray    `gorm:"type:text" json:"excludes"`
	Equipment          StringArray    `gorm:"type:text" json:"equipment"`
	Requirements       string         `gorm:"type:text" json:"requirements"`
	CancellationPolicy string         `gorm:"type:text" json:"cancellation_policy"`
	SeoTitle           string         `gorm:"size:220" json:"seo_title"`
	SeoDescription     string         `gorm:"size:320" json:"seo_description"`
	Featured           bool           `gorm:"default:false;index" json:"featured"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`

	Itineraries []PackageItinerary `gorm:"foreignKey:PackageID;constraint:OnDelete:CASCADE" json:"itineraries,omitempty"`
	Addons      []PackageAddon     `gorm:"foreignKey:PackageID;constraint:OnDelete:CASCADE" json:"addons,omitempty"`
	FAQs        []PackageFAQ       `gorm:"foreignKey:PackageID;constraint:OnDelete:CASCADE" json:"faqs,omitempty"`
	Departures  []PackageDeparture `gorm:"foreignKey:PackageID;constraint:OnDelete:CASCADE" json:"departures,omitempty"`
}

type PackageItinerary struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	PackageID     uint      `gorm:"not null;index" json:"package_id"`
	DayNumber     int       `gorm:"not null" json:"day_number"`
	Title         string    `gorm:"size:220;not null" json:"title"`
	Description   string    `gorm:"type:text" json:"description"`
	Meals         string    `gorm:"size:120" json:"meals"`
	Accommodation string    `gorm:"size:120" json:"accommodation"`
	SortOrder     int       `gorm:"default:0" json:"sort_order"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type PackageAddon struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	PackageID   uint      `gorm:"not null;index" json:"package_id"`
	Name        string    `gorm:"size:150;not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Price       int64     `gorm:"not null" json:"price"`
	PricingType string    `gorm:"size:20;default:'per_person'" json:"pricing_type"`
	Active      bool      `gorm:"default:true" json:"active"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type PackageFAQ struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PackageID uint      `gorm:"not null;index" json:"package_id"`
	Question  string    `gorm:"size:300;not null" json:"question"`
	Answer    string    `gorm:"type:text;not null" json:"answer"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PackageDeparture struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	PackageID     uint      `gorm:"not null;index;uniqueIndex:idx_package_start" json:"package_id"`
	Package       *Package  `gorm:"foreignKey:PackageID" json:"package,omitempty"`
	StartDate     Date      `gorm:"type:date;not null;uniqueIndex:idx_package_start" json:"start_date"`
	EndDate       Date      `gorm:"type:date;not null" json:"end_date"`
	Capacity      int       `gorm:"not null" json:"capacity"`
	ReservedCount int       `gorm:"default:0" json:"reserved_count"`
	PriceOverride *int64    `json:"price_override"`
	BookingCutoff Date      `gorm:"type:date" json:"booking_cutoff"`
	Status        string    `gorm:"size:20;default:'open';index" json:"status"`
	GuideName     string    `gorm:"size:120" json:"guide_name"`
	PorterName    string    `gorm:"size:120" json:"porter_name"`
	Notes         string    `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (d PackageDeparture) SeatsLeft() int {
	left := d.Capacity - d.ReservedCount
	if left < 0 {
		return 0
	}
	return left
}

type Booking struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	BookingCode       string         `gorm:"size:40;not null;uniqueIndex" json:"booking_code"`
	UserID            uint           `gorm:"not null;index" json:"user_id"`
	User              *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	DepartureID       uint           `gorm:"not null;index" json:"departure_id"`
	Departure         *PackageDeparture `gorm:"foreignKey:DepartureID" json:"departure,omitempty"`
	Status            string         `gorm:"size:30;default:'draft';index" json:"status"`
	Subtotal          int64          `gorm:"not null" json:"subtotal"`
	Discount          int64          `gorm:"default:0" json:"discount"`
	Tax               int64          `gorm:"default:0" json:"tax"`
	Total             int64          `gorm:"not null" json:"total"`
	Currency          string         `gorm:"size:3;default:'IDR'" json:"currency"`
	NumberOfTravelers int            `gorm:"not null" json:"number_of_travelers"`
	OrganizerName     string         `gorm:"size:120;not null" json:"organizer_name"`
	OrganizerPhone    string         `gorm:"size:30;not null" json:"organizer_phone"`
	OrganizerEmail    string         `gorm:"size:150" json:"organizer_email"`
	Notes             string         `gorm:"type:text" json:"notes"`
	InternalNotes     string         `gorm:"type:text" json:"internal_notes,omitempty"`
	CouponCode        string         `gorm:"size:50" json:"coupon_code"`
	ExpiresAt         *time.Time     `json:"expires_at"`
	ConfirmedAt       *time.Time     `json:"confirmed_at"`
	CompletedAt       *time.Time     `json:"completed_at"`
	CancelledAt       *time.Time     `json:"cancelled_at"`
	CancellationReason string        `gorm:"type:text" json:"cancellation_reason"`
	ConsentAt         *time.Time     `json:"consent_at"`
	IdempotencyKey    *string        `gorm:"size:100;uniqueIndex" json:"-"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`

	Items         []BookingItem           `gorm:"foreignKey:BookingID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
	Travelers     []BookingTraveler       `gorm:"foreignKey:BookingID;constraint:OnDelete:CASCADE" json:"travelers,omitempty"`
	Payments      []Payment               `gorm:"foreignKey:BookingID;constraint:OnDelete:CASCADE" json:"payments,omitempty"`
	StatusHistory []BookingStatusHistory  `gorm:"foreignKey:BookingID;constraint:OnDelete:CASCADE" json:"status_history,omitempty"`
	Review        *Review                 `gorm:"foreignKey:BookingID" json:"review,omitempty"`
}

type BookingTraveler struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	BookingID             uint      `gorm:"not null;index" json:"booking_id"`
	Name                  string    `gorm:"size:120;not null" json:"name"`
	BirthDate             *Date     `gorm:"type:date" json:"birth_date"`
	Gender                string    `gorm:"size:20" json:"gender"`
	Nationality           string    `gorm:"size:80" json:"nationality"`
	IDNumber              string    `gorm:"size:80" json:"id_number"`
	EmergencyContactName  string    `gorm:"size:120" json:"emergency_contact_name"`
	EmergencyContactPhone string    `gorm:"size:30" json:"emergency_contact_phone"`
	HealthNote            string    `gorm:"type:text" json:"health_note,omitempty"`
	HealthConsent         bool      `gorm:"default:false" json:"health_consent"`
	IsOrganizer           bool      `gorm:"default:false" json:"is_organizer"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

type BookingItem struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	BookingID    uint      `gorm:"not null;index" json:"booking_id"`
	Type         string    `gorm:"size:20;not null" json:"type"` // package, addon, fee
	ReferenceID  uint      `json:"reference_id"`
	NameSnapshot string    `gorm:"size:220;not null" json:"name_snapshot"`
	UnitPrice    int64     `gorm:"not null" json:"unit_price"`
	Quantity     int       `gorm:"not null" json:"quantity"`
	Total        int64     `gorm:"not null" json:"total"`
	CreatedAt    time.Time `json:"created_at"`
}

type Payment struct {
	ID                uint       `gorm:"primaryKey" json:"id"`
	BookingID         uint       `gorm:"not null;index" json:"booking_id"`
	Booking           *Booking   `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	Provider          string     `gorm:"size:50;not null" json:"provider"`
	ProviderReference string     `gorm:"size:200;not null;uniqueIndex" json:"provider_reference"`
	Amount            int64      `gorm:"not null" json:"amount"`
	Currency          string     `gorm:"size:3;default:'IDR'" json:"currency"`
	Status            string     `gorm:"size:20;default:'pending';index" json:"status"`
	Method            string     `gorm:"size:50" json:"method"`
	PaymentURL        string     `gorm:"type:text" json:"payment_url"`
	VirtualAccount    string     `gorm:"size:50" json:"virtual_account"`
	PaidAt            *time.Time `json:"paid_at"`
	ExpiresAt         *time.Time `json:"expires_at"`
	RawEventReference string     `gorm:"size:150" json:"raw_event_reference"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

type PaymentEvent struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	Provider         string    `gorm:"size:50;not null;index" json:"provider"`
	EventID          string    `gorm:"size:150;not null;uniqueIndex" json:"event_id"`
	BookingCode      string    `gorm:"size:40;index" json:"booking_code"`
	PaymentReference string    `gorm:"size:200;index" json:"payment_reference"`
	SignatureValid   bool      `json:"signature_valid"`
	Payload          string    `gorm:"type:longtext" json:"payload"`
	Processed        bool      `gorm:"default:false" json:"processed"`
	ErrorMessage     string    `gorm:"type:text" json:"error_message"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type BookingStatusHistory struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	BookingID     uint      `gorm:"not null;index" json:"booking_id"`
	FromStatus    string    `gorm:"size:30" json:"from_status"`
	ToStatus      string    `gorm:"size:30" json:"to_status"`
	ChangedBy     *uint     `json:"changed_by"`
	ChangedByName string    `gorm:"size:120" json:"changed_by_name"`
	Reason        string    `gorm:"type:text" json:"reason"`
	CreatedAt     time.Time `json:"created_at"`
}

type Coupon struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Code        string    `gorm:"size:50;not null;uniqueIndex" json:"code"`
	Description string    `gorm:"size:250" json:"description"`
	Type        string    `gorm:"size:20;default:'percent'" json:"type"` // percent, fixed
	Value       int64     `gorm:"not null" json:"value"`
	MinSpend    int64     `gorm:"default:0" json:"min_spend"`
	MaxDiscount int64     `gorm:"default:0" json:"max_discount"`
	UsageLimit  int       `gorm:"default:0" json:"usage_limit"`
	UsedCount   int       `gorm:"default:0" json:"used_count"`
	StartsAt    *time.Time `json:"starts_at"`
	EndsAt      *time.Time `json:"ends_at"`
	Active      bool      `gorm:"default:true" json:"active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Review struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	BookingID   uint       `gorm:"not null;uniqueIndex" json:"booking_id"`
	PackageID   uint       `gorm:"not null;index" json:"package_id"`
	UserID      uint       `gorm:"not null;index" json:"user_id"`
	User        *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Rating      int        `gorm:"not null" json:"rating"`
	Title       string     `gorm:"size:200" json:"title"`
	Content     string     `gorm:"type:text" json:"content"`
	Status      string     `gorm:"size:20;default:'pending';index" json:"status"`
	PublishedAt *time.Time `json:"published_at"`
	AdminNote   string     `gorm:"type:text" json:"admin_note,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type Media struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	OwnerType  string    `gorm:"size:50;index" json:"owner_type"`
	OwnerID    uint      `gorm:"index" json:"owner_id"`
	StorageKey string    `gorm:"size:255" json:"storage_key"`
	URL        string    `gorm:"type:text;not null" json:"url"`
	AltText    string    `gorm:"size:250" json:"alt_text"`
	SortOrder  int       `gorm:"default:0" json:"sort_order"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type AuditLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ActorID    *uint     `gorm:"index" json:"actor_id"`
	ActorName  string    `gorm:"size:120" json:"actor_name"`
	Action     string    `gorm:"size:80;not null;index" json:"action"`
	EntityType string    `gorm:"size:60;index" json:"entity_type"`
	EntityID   string    `gorm:"size:60;index" json:"entity_id"`
	Before     string    `gorm:"type:longtext" json:"before,omitempty"`
	After      string    `gorm:"type:longtext" json:"after,omitempty"`
	IPAddress  string    `gorm:"size:60" json:"ip_address"`
	UserAgent  string    `gorm:"size:255" json:"user_agent"`
	CreatedAt  time.Time `json:"created_at"`
}

type ContentPage struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Slug            string    `gorm:"size:120;not null;uniqueIndex" json:"slug"`
	Title           string    `gorm:"size:200;not null" json:"title"`
	Content         string    `gorm:"type:longtext" json:"content"`
	MetaTitle       string    `gorm:"size:200" json:"meta_title"`
	MetaDescription string    `gorm:"size:320" json:"meta_description"`
	Status          string    `gorm:"size:20;default:'published'" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type FAQ struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Question  string    `gorm:"size:300;not null" json:"question"`
	Answer    string    `gorm:"type:text;not null" json:"answer"`
	Category  string    `gorm:"size:60;default:'umum'" json:"category"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	Published bool      `gorm:"default:true" json:"published"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ContactMessage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:120;not null" json:"name"`
	Email     string    `gorm:"size:150;not null" json:"email"`
	Phone     string    `gorm:"size:30" json:"phone"`
	Subject   string    `gorm:"size:200" json:"subject"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	Status    string    `gorm:"size:20;default:'new'" json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type Setting struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	SettingKey string    `gorm:"column:setting_key;size:100;not null;uniqueIndex" json:"key"`
	Value      string    `gorm:"type:text" json:"value"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Notification struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	BookingID *uint      `gorm:"index" json:"booking_id"`
	Type      string     `gorm:"size:50;not null" json:"type"`
	Recipient string     `gorm:"size:150" json:"recipient"`
	Subject   string     `gorm:"size:250" json:"subject"`
	Body      string     `gorm:"type:longtext" json:"body"`
	Status    string     `gorm:"size:20;default:'sent'" json:"status"`
	SentAt    *time.Time `json:"sent_at"`
	CreatedAt time.Time  `json:"created_at"`
}

func IsValidRole(role string) bool {
	switch role {
	case RoleCustomer, RoleAdminOps, RoleAdminContent, RoleSuperAdmin:
		return true
	default:
		return false
	}
}

func ErrNotFound() error { return errors.New("record not found") }
