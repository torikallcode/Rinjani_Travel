package services

import (
	"fmt"
	"strings"
	"time"

	"rinjani-travel-backend/internal/models"
	"rinjani-travel-backend/internal/utils"

	"gorm.io/gorm"
)

type PackageService struct {
	db *gorm.DB
}

func NewPackageService(db *gorm.DB) *PackageService {
	return &PackageService{db: db}
}

type PackageFilter struct {
	Search         string
	Category       string
	Difficulty     string
	MinPrice       int64
	MaxPrice       int64
	Duration       int
	DeparturePoint string
	Date           string
	Featured       bool
	Sort           string
	Status         string
	Page           int
	PageSize       int
}

type DepartureSummary struct {
	ID            uint        `json:"id"`
	StartDate     models.Date `json:"start_date"`
	EndDate       models.Date `json:"end_date"`
	Capacity      int         `json:"capacity"`
	ReservedCount int         `json:"reserved_count"`
	SeatsLeft     int         `json:"seats_left"`
	Price         int64       `json:"price"`
	Status        string      `json:"status"`
	BookingCutoff models.Date `json:"booking_cutoff"`
	GuideName     string      `json:"guide_name,omitempty"`
}

type PackageCard struct {
	ID             uint              `json:"id"`
	Slug           string            `json:"slug"`
	Title          string            `json:"title"`
	Category       string            `json:"category"`
	Description    string            `json:"description"`
	Image          string            `json:"image"`
	Gallery        models.StringArray `json:"gallery"`
	Difficulty     string            `json:"difficulty"`
	Duration       int               `json:"duration"`
	Days           int               `json:"days"`
	Rating         float64           `json:"rating"`
	ReviewCount    int               `json:"review_count"`
	BasePrice      int64             `json:"base_price"`
	Currency       string            `json:"currency"`
	DeparturePoint string            `json:"departure_point"`
	Featured       bool              `json:"featured"`
	Status         string            `json:"status"`
	NextDeparture  *DepartureSummary `json:"next_departure,omitempty"`
	MinPrice       int64             `json:"min_price"`
	AvailableSeats int               `json:"available_seats"`
}

type ReviewDTO struct {
	ID        uint      `json:"id"`
	Rating    int       `json:"rating"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	UserName  string    `json:"user_name"`
	CreatedAt time.Time `json:"created_at"`
}

type PackageDetail struct {
	models.Package
	Departures []DepartureSummary `json:"departures"`
	Reviews    []ReviewDTO        `json:"reviews"`
}

func (s *PackageService) List(filter PackageFilter) ([]PackageCard, int64, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 {
		filter.PageSize = 12
	}
	if filter.PageSize > 100 {
		filter.PageSize = 100
	}
	status := filter.Status
	if status == "" {
		status = "published"
	}

	query := s.db.Model(&models.Package{}).Where("packages.status = ?", status)
	if filter.Search != "" {
		like := "%" + strings.TrimSpace(filter.Search) + "%"
		query = query.Where("packages.title LIKE ? OR packages.description LIKE ? OR packages.departure_point LIKE ?", like, like, like)
	}
	if filter.Category != "" {
		query = query.Where("packages.category = ?", filter.Category)
	}
	if filter.Difficulty != "" {
		query = query.Where("packages.difficulty = ?", filter.Difficulty)
	}
	if filter.MinPrice > 0 {
		query = query.Where("packages.base_price >= ?", filter.MinPrice)
	}
	if filter.MaxPrice > 0 {
		query = query.Where("packages.base_price <= ?", filter.MaxPrice)
	}
	if filter.Duration > 0 {
		query = query.Where("packages.duration <= ?", filter.Duration)
	}
	if filter.DeparturePoint != "" {
		query = query.Where("packages.departure_point LIKE ?", "%"+filter.DeparturePoint+"%")
	}
	if filter.Featured {
		query = query.Where("packages.featured = ?", true)
	}
	if filter.Date != "" {
		query = query.Where(`EXISTS (
			SELECT 1 FROM package_departures d
			WHERE d.package_id = packages.id
			  AND d.status = 'open'
			  AND d.start_date >= ?
			  AND d.capacity > d.reserved_count
			  AND (d.booking_cutoff IS NULL OR d.booking_cutoff >= CURDATE())
		)`, filter.Date)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	switch filter.Sort {
	case "price_asc":
		query = query.Order("packages.base_price ASC")
	case "price_desc":
		query = query.Order("packages.base_price DESC")
	case "rating":
		query = query.Order("packages.rating DESC, packages.review_count DESC")
	case "oldest":
		query = query.Order("packages.created_at ASC")
	default:
		query = query.Order("packages.featured DESC, packages.created_at DESC")
	}

	var packages []models.Package
	if err := query.
		Preload("Departures", "status = ? AND start_date >= ?", "open", time.Now().Format("2006-01-02")).
		Offset((filter.Page - 1) * filter.PageSize).
		Limit(filter.PageSize).
		Find(&packages).Error; err != nil {
		return nil, 0, err
	}

	cards := make([]PackageCard, 0, len(packages))
	for _, pkg := range packages {
		cards = append(cards, s.toCard(pkg))
	}
	return cards, total, nil
}

func (s *PackageService) toCard(pkg models.Package) PackageCard {
	card := PackageCard{
		ID:             pkg.ID,
		Slug:           pkg.Slug,
		Title:          pkg.Title,
		Category:       pkg.Category,
		Description:    pkg.Description,
		Image:          pkg.Image,
		Gallery:        pkg.Gallery,
		Difficulty:     pkg.Difficulty,
		Duration:       pkg.Duration,
		Days:           pkg.Days,
		Rating:         pkg.Rating,
		ReviewCount:    pkg.ReviewCount,
		BasePrice:      pkg.BasePrice,
		Currency:       pkg.Currency,
		DeparturePoint: pkg.DeparturePoint,
		Featured:       pkg.Featured,
		Status:         pkg.Status,
		MinPrice:       pkg.BasePrice,
	}
	var next *models.PackageDeparture
	for i := range pkg.Departures {
		dep := pkg.Departures[i]
		if dep.SeatsLeft() <= 0 || dep.Status != "open" {
			continue
		}
		if dep.BookingCutoff.String() != "" && dep.BookingCutoff.String() < time.Now().Format("2006-01-02") {
			continue
		}
		if next == nil || dep.StartDate.String() < next.StartDate.String() {
			copy := dep
			next = &copy
		}
	}
	if next != nil {
		price := pkg.BasePrice
		if next.PriceOverride != nil && *next.PriceOverride > 0 {
			price = *next.PriceOverride
		}
		card.MinPrice = price
		card.NextDeparture = &DepartureSummary{
			ID:            next.ID,
			StartDate:     next.StartDate,
			EndDate:       next.EndDate,
			Capacity:      next.Capacity,
			ReservedCount: next.ReservedCount,
			SeatsLeft:     next.SeatsLeft(),
			Price:         price,
			Status:        next.Status,
			BookingCutoff: next.BookingCutoff,
			GuideName:     next.GuideName,
		}
		card.AvailableSeats = next.SeatsLeft()
	}
	return card
}

func (s *PackageService) Detail(slug string) (*PackageDetail, error) {
	var pkg models.Package
	if err := s.db.
		Preload("Itineraries", func(db *gorm.DB) *gorm.DB { return db.Order("day_number ASC, sort_order ASC") }).
		Preload("Addons", "active = ?", true).
		Preload("FAQs", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		Preload("Departures", func(db *gorm.DB) *gorm.DB {
			return db.Where("status IN ? AND start_date >= ?", []string{"open", "full", "closed"}, time.Now().Format("2006-01-02")).Order("start_date ASC")
		}).
		Where("slug = ? AND status = ?", slug, "published").
		First(&pkg).Error; err != nil {
		return nil, utils.NotFound("Paket tidak ditemukan.")
	}

	detail := &PackageDetail{Package: pkg, Departures: make([]DepartureSummary, 0, len(pkg.Departures))}
	today := time.Now().Format("2006-01-02")
	for _, dep := range pkg.Departures {
		price := pkg.BasePrice
		if dep.PriceOverride != nil && *dep.PriceOverride > 0 {
			price = *dep.PriceOverride
		}
		status := dep.Status
		seatsLeft := dep.SeatsLeft()
		if status == "open" && seatsLeft <= 0 {
			status = "full"
		}
		if status == "open" && dep.BookingCutoff.String() != "" && dep.BookingCutoff.String() < today {
			status = "closed"
		}
		detail.Departures = append(detail.Departures, DepartureSummary{
			ID:            dep.ID,
			StartDate:     dep.StartDate,
			EndDate:       dep.EndDate,
			Capacity:      dep.Capacity,
			ReservedCount: dep.ReservedCount,
			SeatsLeft:     seatsLeft,
			Price:         price,
			Status:        status,
			BookingCutoff: dep.BookingCutoff,
			GuideName:     dep.GuideName,
		})
	}

	var reviews []models.Review
	if err := s.db.Preload("User").
		Where("package_id = ? AND status = ?", pkg.ID, "published").
		Order("published_at DESC").Limit(20).Find(&reviews).Error; err == nil {
		detail.Reviews = make([]ReviewDTO, 0, len(reviews))
		for _, review := range reviews {
			name := "Pelanggan Rinjani"
			if review.User != nil && review.User.Name != "" {
				name = review.User.Name
			}
			detail.Reviews = append(detail.Reviews, ReviewDTO{
				ID:        review.ID,
				Rating:    review.Rating,
				Title:     review.Title,
				Content:   review.Content,
				UserName:  name,
				CreatedAt: review.CreatedAt,
			})
		}
	}
	return detail, nil
}

func (s *PackageService) Departure(id uint) (*models.PackageDeparture, *models.Package, error) {
	var dep models.PackageDeparture
	if err := s.db.Preload("Package").
		Preload("Package.Itineraries", func(db *gorm.DB) *gorm.DB { return db.Order("day_number ASC") }).
		Preload("Package.Addons", "active = ?", true).
		First(&dep, id).Error; err != nil {
		return nil, nil, utils.NotFound("Jadwal keberangkatan tidak ditemukan.")
	}
	if dep.Package == nil || dep.Package.Status != "published" {
		return nil, nil, utils.NotFound("Paket tidak ditemukan.")
	}
	return &dep, dep.Package, nil
}

func (s *PackageService) AdminList(filter PackageFilter) ([]models.Package, int64, error) {
	filter.Status = strings.TrimSpace(filter.Status)
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 {
		filter.PageSize = 20
	}
	if filter.PageSize > 100 {
		filter.PageSize = 100
	}
	query := s.db.Model(&models.Package{})
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.Search != "" {
		like := "%" + filter.Search + "%"
		query = query.Where("title LIKE ? OR slug LIKE ?", like, like)
	}
	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var packages []models.Package
	if err := query.Preload("Itineraries").Preload("Addons").Preload("FAQs").
		Order("created_at DESC").
		Offset((filter.Page - 1) * filter.PageSize).
		Limit(filter.PageSize).
		Find(&packages).Error; err != nil {
		return nil, 0, err
	}
	return packages, total, nil
}

type ItineraryInput struct {
	DayNumber     int    `json:"day_number"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	Meals         string `json:"meals"`
	Accommodation string `json:"accommodation"`
	SortOrder     int    `json:"sort_order"`
}

type AddonInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Price       int64  `json:"price"`
	PricingType string `json:"pricing_type"`
	Active      bool   `json:"active"`
	SortOrder   int    `json:"sort_order"`
}

type FAQInput struct {
	Question  string `json:"question"`
	Answer    string `json:"answer"`
	SortOrder int    `json:"sort_order"`
}

type PackageInput struct {
	Slug               string            `json:"slug"`
	Title              string            `json:"title" binding:"required"`
	Category           string            `json:"category" binding:"required"`
	Description        string            `json:"description" binding:"required"`
	DescriptionLong    string            `json:"description_long"`
	Image              string            `json:"image"`
	Gallery            models.StringArray `json:"gallery"`
	Difficulty         string            `json:"difficulty"`
	Duration           int               `json:"duration"`
	Days               int               `json:"days"`
	BasePrice          int64             `json:"base_price" binding:"required,gt=0"`
	Currency           string            `json:"currency"`
	Status             string            `json:"status"`
	DeparturePoint     string            `json:"departure_point"`
	MinAge             int               `json:"min_age"`
	MaxAge             int               `json:"max_age"`
	Includes           models.StringArray `json:"includes"`
	Excludes           models.StringArray `json:"excludes"`
	Equipment          models.StringArray `json:"equipment"`
	Requirements       string            `json:"requirements"`
	CancellationPolicy string            `json:"cancellation_policy"`
	SeoTitle           string            `json:"seo_title"`
	SeoDescription     string            `json:"seo_description"`
	Featured           bool              `json:"featured"`
	Itineraries        []ItineraryInput  `json:"itineraries"`
	Addons             []AddonInput      `json:"addons"`
	FAQs               []FAQInput        `json:"faqs"`
}

func (s *PackageService) Create(input PackageInput) (*models.Package, error) {
	slug := utils.Slugify(input.Slug)
	if slug == "" {
		slug = utils.Slugify(input.Title)
	}
	var count int64
	if err := s.db.Model(&models.Package{}).Where("slug = ?", slug).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, utils.Conflict("Slug paket sudah digunakan.")
	}
	pkg := packageFromInput(input, slug)
	if err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&pkg).Error; err != nil {
			return err
		}
		return s.replaceChildren(tx, &pkg, input)
	}); err != nil {
		return nil, err
	}
	return s.AdminGet(pkg.ID)
}

func (s *PackageService) Update(id uint, input PackageInput) (*models.Package, error) {
	var pkg models.Package
	if err := s.db.First(&pkg, id).Error; err != nil {
		return nil, utils.NotFound("Paket tidak ditemukan.")
	}
	slug := utils.Slugify(input.Slug)
	if slug == "" {
		slug = utils.Slugify(input.Title)
	}
	var count int64
	if err := s.db.Model(&models.Package{}).Where("slug = ? AND id <> ?", slug, id).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, utils.Conflict("Slug paket sudah digunakan.")
	}
	updated := packageFromInput(input, slug)
	updated.ID = pkg.ID
	updated.CreatedAt = pkg.CreatedAt
	if err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&pkg).Updates(map[string]interface{}{
			"slug":                updated.Slug,
			"title":               updated.Title,
			"category":            updated.Category,
			"description":         updated.Description,
			"description_long":    updated.DescriptionLong,
			"image":               updated.Image,
			"gallery":             updated.Gallery,
			"difficulty":          updated.Difficulty,
			"duration":            updated.Duration,
			"days":                updated.Days,
			"base_price":          updated.BasePrice,
			"currency":            updated.Currency,
			"status":              updated.Status,
			"departure_point":     updated.DeparturePoint,
			"min_age":             updated.MinAge,
			"max_age":             updated.MaxAge,
			"includes":            updated.Includes,
			"excludes":            updated.Excludes,
			"equipment":           updated.Equipment,
			"requirements":        updated.Requirements,
			"cancellation_policy": updated.CancellationPolicy,
			"seo_title":           updated.SeoTitle,
			"seo_description":     updated.SeoDescription,
			"featured":            updated.Featured,
		}).Error; err != nil {
			return err
		}
		return s.replaceChildren(tx, &pkg, input)
	}); err != nil {
		return nil, err
	}
	return s.AdminGet(id)
}

func (s *PackageService) replaceChildren(tx *gorm.DB, pkg *models.Package, input PackageInput) error {
	if err := tx.Where("package_id = ?", pkg.ID).Delete(&models.PackageItinerary{}).Error; err != nil {
		return err
	}
	if err := tx.Where("package_id = ?", pkg.ID).Delete(&models.PackageAddon{}).Error; err != nil {
		return err
	}
	if err := tx.Where("package_id = ?", pkg.ID).Delete(&models.PackageFAQ{}).Error; err != nil {
		return err
	}
	itineraries := make([]models.PackageItinerary, 0, len(input.Itineraries))
	for i, item := range input.Itineraries {
		if strings.TrimSpace(item.Title) == "" {
			continue
		}
		day := item.DayNumber
		if day == 0 {
			day = i + 1
		}
		itineraries = append(itineraries, models.PackageItinerary{
			PackageID: pkg.ID, DayNumber: day, Title: item.Title, Description: item.Description,
			Meals: item.Meals, Accommodation: item.Accommodation, SortOrder: item.SortOrder,
		})
	}
	if len(itineraries) > 0 {
		if err := tx.Create(&itineraries).Error; err != nil {
			return err
		}
	}
	addons := make([]models.PackageAddon, 0, len(input.Addons))
	for i, item := range input.Addons {
		if strings.TrimSpace(item.Name) == "" {
			continue
		}
		pricingType := item.PricingType
		if pricingType == "" {
			pricingType = "per_person"
		}
		addons = append(addons, models.PackageAddon{
			PackageID: pkg.ID, Name: item.Name, Description: item.Description, Price: item.Price,
			PricingType: pricingType, Active: item.Active, SortOrder: item.SortOrder + i,
		})
	}
	if len(addons) > 0 {
		if err := tx.Create(&addons).Error; err != nil {
			return err
		}
	}
	faqs := make([]models.PackageFAQ, 0, len(input.FAQs))
	for i, item := range input.FAQs {
		if strings.TrimSpace(item.Question) == "" {
			continue
		}
		faqs = append(faqs, models.PackageFAQ{PackageID: pkg.ID, Question: item.Question, Answer: item.Answer, SortOrder: item.SortOrder + i})
	}
	if len(faqs) > 0 {
		if err := tx.Create(&faqs).Error; err != nil {
			return err
		}
	}
	return nil
}

func packageFromInput(input PackageInput, slug string) models.Package {
	status := input.Status
	if status == "" {
		status = "draft"
	}
	currency := input.Currency
	if currency == "" {
		currency = "IDR"
	}
	difficulty := input.Difficulty
	if difficulty == "" {
		difficulty = "moderate"
	}
	return models.Package{
		Slug: slug, Title: input.Title, Category: input.Category, Description: input.Description,
		DescriptionLong: input.DescriptionLong, Image: input.Image, Gallery: input.Gallery,
		Difficulty: difficulty, Duration: input.Duration, Days: input.Days, BasePrice: input.BasePrice,
		Currency: currency, Status: status, DeparturePoint: input.DeparturePoint, MinAge: input.MinAge,
		MaxAge: input.MaxAge, Includes: input.Includes, Excludes: input.Excludes, Equipment: input.Equipment,
		Requirements: input.Requirements, CancellationPolicy: input.CancellationPolicy,
		SeoTitle: input.SeoTitle, SeoDescription: input.SeoDescription, Featured: input.Featured,
	}
}

func (s *PackageService) AdminGet(id uint) (*models.Package, error) {
	var pkg models.Package
	if err := s.db.Preload("Itineraries", func(db *gorm.DB) *gorm.DB { return db.Order("day_number ASC") }).
		Preload("Addons", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		Preload("FAQs", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		Preload("Departures", func(db *gorm.DB) *gorm.DB { return db.Order("start_date ASC") }).
		First(&pkg, id).Error; err != nil {
		return nil, utils.NotFound("Paket tidak ditemukan.")
	}
	return &pkg, nil
}

func (s *PackageService) Delete(id uint) error {
	var pkg models.Package
	if err := s.db.First(&pkg, id).Error; err != nil {
		return utils.NotFound("Paket tidak ditemukan.")
	}
	var bookingCount int64
	if err := s.db.Model(&models.Booking{}).
		Joins("JOIN package_departures ON package_departures.id = bookings.departure_id").
		Where("package_departures.package_id = ?", id).Count(&bookingCount).Error; err != nil {
		return err
	}
	if bookingCount > 0 {
		return utils.Conflict("Paket sudah memiliki pesanan. Ubah status menjadi draft/arsip alih-alih menghapus.")
	}
	return s.db.Delete(&pkg).Error
}

func (s *PackageService) AdminDepartures(packageID uint) ([]models.PackageDeparture, error) {
	var departures []models.PackageDeparture
	query := s.db.Preload("Package").Order("start_date ASC")
	if packageID > 0 {
		query = query.Where("package_id = ?", packageID)
	}
	if err := query.Find(&departures).Error; err != nil {
		return nil, err
	}
	return departures, nil
}

type DepartureInput struct {
	PackageID     uint        `json:"package_id" binding:"required"`
	StartDate     models.Date `json:"start_date" binding:"required"`
	EndDate       models.Date `json:"end_date" binding:"required"`
	Capacity      int         `json:"capacity" binding:"required,gt=0"`
	PriceOverride *int64      `json:"price_override"`
	BookingCutoff models.Date `json:"booking_cutoff"`
	Status        string      `json:"status"`
	GuideName     string      `json:"guide_name"`
	PorterName    string      `json:"porter_name"`
	Notes         string      `json:"notes"`
}

func (s *PackageService) CreateDeparture(input DepartureInput) (*models.PackageDeparture, error) {
	var pkg models.Package
	if err := s.db.First(&pkg, input.PackageID).Error; err != nil {
		return nil, utils.NotFound("Paket tidak ditemukan.")
	}
	if input.StartDate.Time.IsZero() || input.EndDate.Time.IsZero() {
		return nil, utils.BadRequest("Tanggal mulai dan selesai wajib diisi.")
	}
	if input.EndDate.String() < input.StartDate.String() {
		return nil, utils.BadRequest("Tanggal selesai tidak boleh sebelum tanggal mulai.")
	}
	status := input.Status
	if status == "" {
		status = "open"
	}
	dep := models.PackageDeparture{
		PackageID: input.PackageID, StartDate: input.StartDate, EndDate: input.EndDate,
		Capacity: input.Capacity, PriceOverride: input.PriceOverride, BookingCutoff: input.BookingCutoff,
		Status: status, GuideName: input.GuideName, PorterName: input.PorterName, Notes: input.Notes,
	}
	var count int64
	if err := s.db.Model(&models.PackageDeparture{}).
		Where("package_id = ? AND start_date = ?", input.PackageID, input.StartDate.String()).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, utils.Conflict("Jadwal keberangkatan pada tanggal tersebut sudah ada.")
	}
	if err := s.db.Create(&dep).Error; err != nil {
		return nil, err
	}
	return &dep, nil
}

func (s *PackageService) UpdateDeparture(id uint, input DepartureInput) (*models.PackageDeparture, error) {
	var dep models.PackageDeparture
	if err := s.db.First(&dep, id).Error; err != nil {
		return nil, utils.NotFound("Jadwal keberangkatan tidak ditemukan.")
	}
	if input.Capacity < dep.ReservedCount {
		return nil, utils.Conflict(fmt.Sprintf("Kapasitas tidak boleh lebih kecil dari kuota yang sudah terisi (%d).", dep.ReservedCount))
	}
	if input.EndDate.String() < input.StartDate.String() {
		return nil, utils.BadRequest("Tanggal selesai tidak boleh sebelum tanggal mulai.")
	}
	if input.Status == "" {
		input.Status = dep.Status
	}
	if err := s.db.Model(&dep).Updates(map[string]interface{}{
		"package_id":     input.PackageID,
		"start_date":     input.StartDate,
		"end_date":       input.EndDate,
		"capacity":       input.Capacity,
		"price_override": input.PriceOverride,
		"booking_cutoff": input.BookingCutoff,
		"status":         input.Status,
		"guide_name":     input.GuideName,
		"porter_name":    input.PorterName,
		"notes":          input.Notes,
	}).Error; err != nil {
		return nil, err
	}
	return &dep, nil
}

func (s *PackageService) DeleteDeparture(id uint) error {
	var dep models.PackageDeparture
	if err := s.db.First(&dep, id).Error; err != nil {
		return utils.NotFound("Jadwal keberangkatan tidak ditemukan.")
	}
	var count int64
	if err := s.db.Model(&models.Booking{}).Where("departure_id = ?", id).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return utils.Conflict("Jadwal ini sudah memiliki pesanan. Tutup jadwal alih-alih menghapus.")
	}
	return s.db.Delete(&dep).Error
}
