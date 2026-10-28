package seeders

import (
	"fmt"
	"log"
	"time"

	"rinjani-travel-backend/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func RunAllSeeders(db *gorm.DB) error {
	if err := SeedUsers(db); err != nil {
		return err
	}
	if err := SeedSettings(db); err != nil {
		return err
	}
	if err := SeedContent(db); err != nil {
		return err
	}
	if err := SeedPackages(db); err != nil {
		return err
	}
	if err := SeedDepartures(db); err != nil {
		return err
	}
	if err := SeedCoupons(db); err != nil {
		return err
	}
	if err := SeedFAQs(db); err != nil {
		return err
	}
	if err := SeedDemoReviews(db); err != nil {
		return err
	}
	return nil
}

func SeedUsers(db *gorm.DB) error {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte("Admin123!"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	customerHash, err := bcrypt.GenerateFromPassword([]byte("Customer123!"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	now := time.Now()
	users := []models.User{
		{Name: "Super Admin", Email: "superadmin@rinjanitravel.com", Phone: "6281234567890", PasswordHash: string(hash), Role: models.RoleSuperAdmin, EmailVerifiedAt: &now, IsActive: true},
		{Name: "Admin Operasional", Email: "ops@rinjanitravel.com", Phone: "6281234567891", PasswordHash: string(hash), Role: models.RoleAdminOps, EmailVerifiedAt: &now, IsActive: true},
		{Name: "Admin Konten", Email: "content@rinjanitravel.com", Phone: "6281234567892", PasswordHash: string(hash), Role: models.RoleAdminContent, EmailVerifiedAt: &now, IsActive: true},
		{Name: "Demo Customer", Email: "customer@example.com", Phone: "6281234567893", Country: "Indonesia", PasswordHash: string(customerHash), Role: models.RoleCustomer, EmailVerifiedAt: &now, IsActive: true},
	}
	if err := db.Create(&users).Error; err != nil {
		return err
	}
	log.Println("✓ Users seeded")
	return nil
}

func SeedSettings(db *gorm.DB) error {
	settings := map[string]string{
		"business_name":               "Rinjani Travel",
		"business_email":              "hello@rinjanitravel.com",
		"business_phone":              "+62 812-3456-7890",
		"business_address":            "Jl. Raya Sembalun, Lombok Timur, Nusa Tenggara Barat",
		"whatsapp":                    "6281234567890",
		"instagram":                   "@rinjanitravel",
		"tax_percent":                 "0",
		"booking_hold_minutes":        "30",
		"payment_instructions":        "Pembayaran diverifikasi otomatis melalui webhook gateway. Jangan membayar ke rekening pribadi.",
		"cancellation_policy_summary": "Pembatalan gratis hingga 14 hari sebelum keberangkatan. Setelah itu berlaku potongan sesuai kebijakan.",
		"safety_note":                 "Semua trip dipandu guide bersertifikat dan dilengkapi perlengkapan keselamatan.",
	}
	for key, value := range settings {
		setting := models.Setting{SettingKey: key}
		if err := db.Where("setting_key = ?", key).Assign(models.Setting{Value: value}).FirstOrCreate(&setting).Error; err != nil {
			return err
		}
	}
	return nil
}

func SeedContent(db *gorm.DB) error {
	pages := []models.ContentPage{
		{Slug: "about", Title: "Tentang Rinjani Travel", MetaTitle: "Tentang Kami - Rinjani Travel", MetaDescription: "Operator lokal trekking Rinjani dan wisata Lombok.", Content: `<p>Rinjani Travel adalah operator perjalanan lokal yang berbasis di Lombok, Nusa Tenggara Barat. Kami fokus pada trekking Gunung Rinjani dan wisata alam Lombok dengan tim guide, porter, dan driver yang berpengalaman.</p><p>Kami percaya perjalanan yang baik adalah perjalanan yang aman, jujur, dan memberi manfaat bagi komunitas lokal. Setiap paket dirancang dengan informasi yang jelas mengenai itinerary, fasilitas, kesiapan fisik, dan kebijakan pembatalan.</p><h3>Mengapa memilih kami?</h3><ul><li>Guide lokal bersertifikat dan porter berpengalaman.</li><li>Perlengkapan camping berkualitas dan makanan higienis.</li><li>Harga transparan tanpa biaya tersembunyi.</li><li>Dukungan sebelum, selama, dan setelah perjalanan.</li></ul>`, Status: "published"},
		{Slug: "privacy", Title: "Kebijakan Privasi", MetaTitle: "Kebijakan Privasi - Rinjani Travel", MetaDescription: "Bagaimana kami mengumpulkan dan melindungi data Anda.", Content: `<p>Kami hanya mengumpulkan data yang diperlukan untuk memproses pesanan: identitas pemesan, kontak, data peserta, dan informasi pembayaran. Data kesehatan hanya dikumpulkan bila diperlukan untuk keselamatan dan aksesnya dibatasi.</p><p>Kami tidak menjual data pribadi Anda. Data dibagikan kepada guide/porter hanya sebatas kebutuhan operasional. Anda dapat meminta akses, koreksi, atau penghapusan data dengan menghubungi hello@rinjanitravel.com.</p><p>Data transaksi disimpan sesuai kewajiban hukum dan kebutuhan rekonsiliasi. Kata sandi disimpan dalam bentuk hash; kami tidak pernah menyimpan kata sandi dalam bentuk teks biasa.</p>`, Status: "published"},
		{Slug: "terms", Title: "Syarat dan Ketentuan", MetaTitle: "Syarat dan Ketentuan - Rinjani Travel", MetaDescription: "Ketentuan pemesanan dan penggunaan layanan.", Content: `<p>Dengan membuat pesanan, Anda menyatakan bahwa informasi yang diberikan benar dan Anda berwenang mewakili seluruh peserta. Harga yang berlaku adalah harga yang tertera pada invoice saat checkout.</p><p>Kuota ditahan selama 30 menit. Jika pembayaran tidak diselesaikan, pesanan otomatis kedaluwarsa dan kuota dilepas. Konfirmasi pembayaran hanya sah bila diverifikasi melalui webhook gateway resmi.</p><p>Peserta wajib mengikuti instruksi guide dan mematuhi aturan Taman Nasional Gunung Rinjani. Perubahan jadwal karena cuaca, izin taman nasional, atau force majeure akan dikomunikasikan oleh tim operasional.</p>`, Status: "published"},
		{Slug: "cancellation", Title: "Kebijakan Pembatalan", MetaTitle: "Kebijakan Pembatalan - Rinjani Travel", MetaDescription: "Aturan pembatalan, refund, dan reschedule.", Content: `<p>Pembatalan lebih dari 14 hari sebelum keberangkatan: refund 100% dikurangi biaya administrasi. Pembatalan 7-14 hari: refund 50%. Pembatalan kurang dari 7 hari: tidak ada refund, namun reschedule dapat diajukan sesuai ketersediaan.</p><p>Pembatalan karena penutupan jalur oleh pihak berwenang akan ditawarkan reschedule atau refund penuh. Permintaan refund diproses melalui dashboard admin dan membutuhkan waktu hingga 7 hari kerja.</p>`, Status: "published"},
		{Slug: "safety", Title: "Keselamatan", MetaTitle: "Keselamatan - Rinjani Travel", MetaDescription: "Standar keselamatan trekking Rinjani.", Content: `<p>Keselamatan adalah prioritas utama. Guide kami dilatih untuk pertolongan pertama, evakuasi, dan manajemen risiko di jalur Rinjani. Setiap kelompok dilengkapi perlengkapan darurat dan komunikasi.</p><p>Peserta dengan kondisi medis tertentu wajib memberi tahu kami saat checkout. Data ini bersifat rahasia dan hanya diakses tim operasional yang berwenang. Kami berhak menolak peserta yang tidak memenuhi syarat keselamatan.</p><h3>Persiapan fisik</h3><p>Latihan kardio dan hiking minimal 4-6 minggu sebelum keberangkatan sangat disarankan. Bawa obat pribadi, jaket hangat, headlamp, dan sepatu trekking yang sudah teruji.</p>`, Status: "published"},
	}
	for _, page := range pages {
		record := models.ContentPage{Slug: page.Slug}
		if err := db.Where("slug = ?", page.Slug).Assign(page).FirstOrCreate(&record).Error; err != nil {
			return err
		}
	}
	return nil
}

type seedItinerary struct {
	Day         int
	Title       string
	Description string
	Meals       string
	Stay        string
}

type seedAddon struct {
	Name        string
	Description string
	Price       int64
	PricingType string
}

type seedFAQ struct {
	Question string
	Answer   string
}

type seedPackage struct {
	Package     models.Package
	Itineraries []seedItinerary
	Addons      []seedAddon
	FAQs        []seedFAQ
}

func SeedPackages(db *gorm.DB) error {
	commonIncludes := models.StringArray{
		"Penjemputan dan pengantaran di area Lombok",
		"Guide dan porter berpengalaman",
		"Perlengkapan camping (tenda, sleeping bag, matras, alat masak, tenda toilet)",
		"Makan dan minum sesuai itinerary",
		"Tiket masuk Taman Nasional dan asuransi trekking",
		"Transportasi lokal selama perjalanan",
	}
	commonExcludes := models.StringArray{
		"Tiket pesawat dan transportasi antar pulau",
		"Asuransi perjalanan pribadi",
		"Pengeluaran pribadi dan tips guide/porter",
		"Sewa perlengkapan tambahan di luar paket",
		"Layanan yang tidak disebutkan pada bagian termasuk",
	}
	commonEquipment := models.StringArray{
		"Sepatu trekking yang nyaman",
		"Jaket hangat / windbreaker",
		"Headlamp dan baterai cadangan",
		"Botol minum minimal 2 liter",
		"Tabir surya dan topi",
		"Obat pribadi",
	}
	packages := []seedPackage{
		{
			Package: models.Package{
				Slug: "rinjani-summit-trekking-4d3n-sembalun", Title: "Rinjani Summit Trekking 4D3N via Sembalun",
				Category: "trekking", Difficulty: "hard", Duration: 4, Days: 4, Rating: 4.9, ReviewCount: 12,
				BasePrice: 2750000, Currency: "IDR", Status: "published", Featured: true,
				Description: "Trekking 4 hari 3 malam ke puncak Rinjani (3.726 m) melalui Sembalun, danau Segara Anak, dan crater rim Senaru.",
				DescriptionLong: "Program trekking lengkap untuk pendaki dengan kebugaran baik. Anda akan melewati savana Sembalun, berkemah di crater rim, menyaksikan matahari terbit dari puncak Rinjani, lalu turun ke danau Segara Anak dan crater rim Senaru. Jalur ini menantang namun memberikan panorama terbaik Pulau Lombok.",
				Image: "/img/Rinjani.jpg", Gallery: models.StringArray{"/img/Rinjani.jpg", "/img/mnt4.jpg", "/img/mnt10.jpg", "/img/mnt14.jpg"},
				DeparturePoint: "Sembalun, Lombok Timur", MinAge: 15, MaxAge: 65,
				Includes: commonIncludes, Excludes: commonExcludes, Equipment: commonEquipment,
				Requirements: "Kebugaran fisik baik, mampu berjalan 6-8 jam per hari, tidak memiliki kondisi jantung/paru-paru serius. Latihan hiking minimal 4 minggu sebelum keberangkatan.",
				CancellationPolicy: "Pembatalan >14 hari: refund 100% dikurangi biaya admin. 7-14 hari: refund 50%. <7 hari: reschedule sesuai ketersediaan.",
				SeoTitle: "Trekking Rinjani 4D3N via Sembalun | Rinjani Travel",
				SeoDescription: "Paket trekking Rinjani 4 hari 3 malam ke puncak 3.726 m via Sembalun. Guide lokal, perlengkapan lengkap, harga transparan.",
			},
			Itineraries: []seedItinerary{
				{1, "Sembalun Village - Sembalun Crater Rim", "Penjemputan pagi dari hotel, registrasi di Rinjani Information Center, lalu mendaki melewati savana dan pos 1-3. Camp di crater rim Sembalun (2.639 m) dengan pemandangan matahari terbenam.", "Sarapan, makan siang, makan malam", "Tenda di crater rim"},
				{2, "Summit Rinjani - Segara Anak Lake", "Pendakian dini hari ke puncak Rinjani (3.726 m) untuk menyaksikan sunrise. Setelah turun, lanjut ke danau Segara Anak dan berendam di air panas alami.", "Sarapan, makan siang, makan malam", "Tenda di tepi danau"},
				{3, "Segara Anak - Senaru Crater Rim", "Mendaki dari danau menuju crater rim Senaru (2.641 m). Nikmati panorama Gunung Agung dan asap vulkanik dari bibir danau.", "Sarapan, makan siang, makan malam", "Tenda di Senaru crater rim"},
				{4, "Senaru Crater Rim - Senaru Village", "Turun melalui hutan hujan tropis menuju Desa Senaru. Makan siang di jalan, lalu pengantaran ke destinasi berikutnya.", "Sarapan, makan siang", "-"},
			},
			Addons: []seedAddon{
				{"Private Trip (tidak digabung)", "Kelompok Anda tidak digabung dengan peserta lain.", 750000, "per_booking"},
				{"Sewa Sleeping Bag Premium", "Sleeping bag down -5°C untuk kenyamanan ekstra.", 150000, "per_person"},
				{"Transfer Bandara Lombok (PP)", "Penjemputan dan pengantaran Bandara Lombok.", 450000, "per_booking"},
				{"Porter Pribadi", "Porter tambahan untuk membawa tas pribadi Anda.", 500000, "per_person"},
			},
			FAQs: []seedFAQ{
				{"Apakah pemula bisa ikut trekking ini?", "Program ini ditujukan untuk pendaki dengan kebugaran baik. Jika Anda pemula, kami menyarankan paket 3D2N crater rim atau latihan fisik minimal 4 minggu sebelumnya."},
				{"Bagaimana jika cuaca buruk?", "Keselamatan adalah prioritas. Guide dapat mengubah rute atau membatalkan summit attack jika kondisi tidak aman. Keputusan diambil oleh guide di lapangan."},
				{"Apakah ada batas usia?", "Usia minimum 15 tahun dan maksimum 65 tahun untuk paket summit. Peserta di luar rentang usia dapat menghubungi kami untuk asesmen."},
			},
		},
		{
			Package: models.Package{
				Slug: "rinjani-crater-rim-3d2n-senaru", Title: "Rinjani Crater Rim 3D2N via Senaru",
				Category: "trekking", Difficulty: "moderate", Duration: 3, Days: 3, Rating: 4.7, ReviewCount: 8,
				BasePrice: 2100000, Currency: "IDR", Status: "published", Featured: true,
				Description: "Trekking 3 hari 2 malam ke crater rim Senaru dengan panorama danau Segara Anak. Cocok untuk pendaki pemula yang aktif.",
				DescriptionLong: "Rute Senaru melewati hutan hujan tropis yang rindang dan berakhir di crater rim dengan pemandangan danau Segara Anak serta puncak Rinjani. Program ini lebih ramah bagi pendaki pemula namun tetap membutuhkan kebugaran dasar.",
				Image: "/img/mnt5.jpg", Gallery: models.StringArray{"/img/mnt5.jpg", "/img/mnt6.jpg", "/img/mnt7.jpg"},
				DeparturePoint: "Senaru, Lombok Utara", MinAge: 12, MaxAge: 70,
				Includes: commonIncludes, Excludes: commonExcludes, Equipment: commonEquipment,
				Requirements: "Mampu berjalan 4-6 jam per hari. Cocok untuk pendaki pemula yang aktif.",
				CancellationPolicy: "Pembatalan >14 hari: refund 100% dikurangi biaya admin. 7-14 hari: refund 50%. <7 hari: reschedule sesuai ketersediaan.",
				SeoTitle: "Trekking Rinjani 3D2N via Senaru | Rinjani Travel",
				SeoDescription: "Trekking Rinjani 3 hari 2 malam ke crater rim Senaru. Cocok untuk pemula aktif dengan guide lokal.",
			},
			Itineraries: []seedItinerary{
				{1, "Senaru Village - Senaru Crater Rim", "Registrasi, trekking melalui hutan hujan tropis melewati pos 1-3, tiba di crater rim Senaru untuk camping dan menikmati sunset.", "Makan siang, makan malam", "Tenda di crater rim"},
				{2, "Crater Rim - Segara Anak Lake - Crater Rim", "Turun ke danau Segara Anak, berendam di air panas, makan siang, lalu kembali ke crater rim untuk bermalam.", "Sarapan, makan siang, makan malam", "Tenda di crater rim"},
				{3, "Crater Rim - Senaru Village", "Turun melalui hutan menuju Desa Senaru, makan siang, lalu pengantaran.", "Sarapan, makan siang", "-"},
			},
			Addons: []seedAddon{
				{"Private Trip (tidak digabung)", "Kelompok Anda tidak digabung dengan peserta lain.", 600000, "per_booking"},
				{"Sewa Sleeping Bag Premium", "Sleeping bag down -5°C.", 150000, "per_person"},
				{"Transfer Bandara Lombok (PP)", "Penjemputan dan pengantaran Bandara Lombok.", 450000, "per_booking"},
			},
			FAQs: []seedFAQ{
				{"Apakah trekking ini cocok untuk pemula?", "Ya, selama Anda memiliki kebugaran dasar dan mampu berjalan 4-6 jam per hari. Guide akan mengatur ritme perjalanan."},
				{"Apakah bisa melihat puncak Rinjani?", "Anda akan melihat puncak dari crater rim, namun paket ini tidak melakukan summit attack."},
			},
		},
		{
			Package: models.Package{
				Slug: "rinjani-lake-summit-5d4n", Title: "Rinjani Lake & Summit Explorer 5D4N",
				Category: "trekking", Difficulty: "challenging", Duration: 5, Days: 5, Rating: 4.8, ReviewCount: 5,
				BasePrice: 3400000, Currency: "IDR", Status: "published", Featured: false,
				Description: "Eksplorasi Rinjani 5 hari 4 malam: summit, danau Segara Anak, air panas, dan crater rim Senaru dengan ritme lebih santai.",
				DescriptionLong: "Paket 5 hari memberikan waktu lebih untuk aklimatisasi dan menikmati setiap bagian perjalanan. Cocok untuk pendaki yang ingin pengalaman lengkap tanpa terburu-buru.",
				Image: "/img/mnt8.jpg", Gallery: models.StringArray{"/img/mnt8.jpg", "/img/mnt9.jpg", "/img/mnt11.jpg", "/img/mnt12.jpg"},
				DeparturePoint: "Sembalun, Lombok Timur", MinAge: 15, MaxAge: 65,
				Includes: commonIncludes, Excludes: commonExcludes, Equipment: commonEquipment,
				Requirements: "Kebugaran baik dan pengalaman mendaki. Disarankan sudah pernah mendaki gunung minimal 2.000 m.",
				CancellationPolicy: "Pembatalan >14 hari: refund 100% dikurangi biaya admin. 7-14 hari: refund 50%. <7 hari: reschedule sesuai ketersediaan.",
				SeoTitle: "Rinjani Lake & Summit 5D4N | Rinjani Travel",
				SeoDescription: "Paket lengkap Rinjani 5 hari 4 malam dengan summit, danau Segara Anak, dan crater rim Senaru.",
			},
			Itineraries: []seedItinerary{
				{1, "Sembalun - Crater Rim", "Penjemputan, registrasi, trekking ke crater rim Sembalun, camping.", "Makan siang, makan malam", "Tenda"},
				{2, "Summit Attack", "Pendakian puncak Rinjani dini hari, kembali ke camp, istirahat.", "Sarapan, makan siang, makan malam", "Tenda"},
				{3, "Crater Rim - Segara Anak Lake", "Turun ke danau, berendam air panas, eksplorasi sekitar danau.", "Sarapan, makan siang, makan malam", "Tenda di danau"},
				{4, "Lake - Senaru Crater Rim", "Mendaki ke crater rim Senaru, menikmati sunset.", "Sarapan, makan siang, makan malam", "Tenda"},
				{5, "Senaru Crater Rim - Senaru Village", "Turun ke Desa Senaru dan pengantaran.", "Sarapan, makan siang", "-"},
			},
			Addons: []seedAddon{
				{"Private Trip (tidak digabung)", "Kelompok Anda tidak digabung dengan peserta lain.", 900000, "per_booking"},
				{"Porter Pribadi", "Porter tambahan untuk tas pribadi.", 650000, "per_person"},
			},
			FAQs: []seedFAQ{{"Apa bedanya dengan paket 4D3N?", "Paket 5D4N memberi waktu aklimatisasi dan istirahat lebih banyak, sehingga lebih nyaman untuk pendaki yang ingin menikmati perjalanan tanpa terburu-buru."}},
		},
		{
			Package: models.Package{
				Slug: "gili-islands-hopping-day-tour", Title: "Gili Islands Hopping Day Tour",
				Category: "tour", Difficulty: "easy", Duration: 1, Days: 1, Rating: 4.8, ReviewCount: 20,
				BasePrice: 650000, Currency: "IDR", Status: "published", Featured: true,
				Description: "Island hopping sehari ke Gili Trawangan, Gili Meno, dan Gili Air dengan snorkeling, boat, dan makan siang.",
				DescriptionLong: "Nikmati tiga Gili dalam satu hari. Snorkeling di spot penyu, menikmati pantai pasir putih, dan menjelajahi pulau tanpa kendaraan bermotor. Paket cocok untuk pasangan, keluarga, dan solo traveler.",
				Image: "/img/trawangan.jpg", Gallery: models.StringArray{"/img/trawangan.jpg", "/img/trawangan2.png", "/img/turtle.webp"},
				DeparturePoint: "Pelabuhan Bangsal, Lombok Utara", MinAge: 5, MaxAge: 75,
				Includes: models.StringArray{"Boat transfer antar Gili", "Peralatan snorkeling", "Guide lokal", "Makan siang", "Air mineral", "Asuransi perjalanan"},
				Excludes: models.StringArray{"Transportasi ke Pelabuhan Bangsal", "Pengeluaran pribadi", "Tips guide", "Sewa sepeda di Gili"},
				Equipment: models.StringArray{"Pakaian renang", "Tabir surya", "Topi", "Handuk", "Kacamata hitam"},
				Requirements: "Bisa berenang dasar disarankan. Anak-anak harus didampingi orang tua.",
				CancellationPolicy: "Pembatalan >48 jam: refund 100%. <48 jam: tidak ada refund namun dapat reschedule.",
				SeoTitle: "Gili Islands Hopping Tour Lombok | Rinjani Travel",
				SeoDescription: "Tur island hopping Gili Trawangan, Meno, dan Air dengan snorkeling dan makan siang.",
			},
			Itineraries: []seedItinerary{{1, "Gili Islands Day Tour", "Penjemputan di Pelabuhan Bangsal, boat ke Gili Trawangan, snorkeling di Gili Meno, makan siang, lanjut Gili Air, kembali ke Lombok.", "Makan siang", "-"}},
			Addons: []seedAddon{
				{"GoPro Underwater Rental", "Sewa GoPro untuk dokumentasi bawah air.", 200000, "per_booking"},
				{"Private Boat", "Boat privat untuk kelompok Anda.", 1200000, "per_booking"},
			},
			FAQs: []seedFAQ{{"Apakah bisa snorkeling untuk pemula?", "Ya, guide akan membantu dan menyediakan pelampung. Spot snorkeling dipilih sesuai kondisi."}},
		},
		{
			Package: models.Package{
				Slug: "lombok-waterfall-sasak-village-tour", Title: "Lombok Waterfall & Sasak Village Tour",
				Category: "tour", Difficulty: "easy", Duration: 1, Days: 1, Rating: 4.6, ReviewCount: 14,
				BasePrice: 550000, Currency: "IDR", Status: "published", Featured: false,
				Description: "Jelajahi air terjun Sendang Gile & Tiu Kelep serta budaya Desa Sade dalam satu hari.",
				DescriptionLong: "Kombinasi alam dan budaya: air terjun di kaki Rinjani, hutan tropis, dan kehidupan tradisional Sasak di Desa Sade. Cocok untuk keluarga dan fotografer.",
				Image: "/img/DesaSade.jpg", Gallery: models.StringArray{"/img/DesaSade.jpg", "/img/mnt13.jpg", "/img/mnt15.jpg"},
				DeparturePoint: "Senaru, Lombok Utara", MinAge: 5, MaxAge: 75,
				Includes: models.StringArray{"Transportasi AC", "Guide lokal", "Tiket masuk air terjun", "Makan siang", "Air mineral"},
				Excludes: models.StringArray{"Pengeluaran pribadi", "Tips guide/driver", "Donasi desa"},
				Equipment: models.StringArray{"Sepatu anti-slip", "Pakaian cepat kering", "Baju ganti", "Kamera"},
				Requirements: "Berjalan menurun dan menaiki tangga di area air terjun. Tidak disarankan untuk yang memiliki masalah lutut berat.",
				CancellationPolicy: "Pembatalan >48 jam: refund 100%. <48 jam: reschedule sesuai ketersediaan.",
				SeoTitle: "Waterfall & Sasak Village Tour Lombok | Rinjani Travel",
				SeoDescription: "Tur sehari air terjun Sendang Gile, Tiu Kelep, dan Desa Sade bersama guide lokal.",
			},
			Itineraries: []seedItinerary{{1, "Senaru Waterfalls & Sade Village", "Penjemputan pagi, trekking ringan ke Sendang Gile dan Tiu Kelep, makan siang, kunjungi Desa Sade, kembali ke hotel.", "Makan siang", "-"}},
			Addons: []seedAddon{{"Private Tour", "Tur privat dengan kendaraan sendiri.", 450000, "per_booking"}},
			FAQs: []seedFAQ{{"Apakah cocok untuk anak-anak?", "Ya, dengan pendampingan orang tua. Jalur air terjun memiliki tangga dan bebatuan."}},
		},
		{
			Package: models.Package{
				Slug: "pink-beach-snorkeling-day-trip", Title: "Pink Beach & Snorkeling Day Trip",
				Category: "tour", Difficulty: "easy", Duration: 1, Days: 1, Rating: 4.7, ReviewCount: 11,
				BasePrice: 750000, Currency: "IDR", Status: "published", Featured: true,
				Description: "Kunjungi Pantai Pink, snorkeling di perairan jernih Lombok Timur, dan nikmati makan siang tepi pantai.",
				DescriptionLong: "Pantai Pink terkenal dengan pasirnya yang berwarna lembut dan air laut yang jernih. Paket ini mencakup boat, snorkeling, dan makan siang di tepi pantai.",
				Image: "/img/pinkbeach.jpg", Gallery: models.StringArray{"/img/pinkbeach.jpg", "/img/mandalika.webp", "/img/turtle.webp"},
				DeparturePoint: "Jerowaru, Lombok Timur", MinAge: 6, MaxAge: 70,
				Includes: models.StringArray{"Boat ke Pantai Pink", "Peralatan snorkeling", "Guide", "Makan siang", "Air mineral", "Asuransi"},
				Excludes: models.StringArray{"Transportasi ke Jerowaru", "Pengeluaran pribadi", "Tips guide"},
				Equipment: models.StringArray{"Pakaian renang", "Tabir surya", "Topi", "Handuk"},
				Requirements: "Bisa berenang dasar. Perjalanan boat bisa berombak, tidak disarankan untuk ibu hamil.",
				CancellationPolicy: "Pembatalan >48 jam: refund 100%. <48 jam: reschedule sesuai ketersediaan.",
				SeoTitle: "Pink Beach Lombok Snorkeling Tour | Rinjani Travel",
				SeoDescription: "Day trip Pantai Pink Lombok dengan snorkeling, boat, dan makan siang tepi pantai.",
			},
			Itineraries: []seedItinerary{{1, "Pink Beach Day Trip", "Berangkat pagi dari Jerowaru, boat ke Pantai Pink, snorkeling di dua spot, makan siang, waktu bebas, kembali sore.", "Makan siang", "-"}},
			Addons: []seedAddon{{"GoPro Underwater Rental", "Dokumentasi bawah air.", 200000, "per_booking"}},
			FAQs: []seedFAQ{{"Apakah pantainya benar-benar pink?", "Pasir memiliki rona merah muda lembut yang paling terlihat saat matahari cerah. Warna dapat berbeda tergantung cahaya."}},
		},
		{
			Package: models.Package{
				Slug: "mandalika-kuta-sunset-tour", Title: "Mandalika & Kuta Sunset Tour",
				Category: "tour", Difficulty: "easy", Duration: 1, Days: 1, Rating: 4.5, ReviewCount: 9,
				BasePrice: 450000, Currency: "IDR", Status: "published", Featured: false,
				Description: "Setengah hari menjelajahi Sirkuit Mandalika, Pantai Kuta, dan menikmati sunset di Bukit Merese.",
				DescriptionLong: "Tur santai setengah hari untuk melihat sisi modern dan alami Lombok Tengah: Sirkuit Mandalika, Pantai Kuta, dan panorama sunset Bukit Merese.",
				Image: "/img/mandalika.webp", Gallery: models.StringArray{"/img/mandalika.webp", "/img/mnt14.jpg", "/img/pinkbeach.jpg"},
				DeparturePoint: "Kuta, Lombok Tengah", MinAge: 0, MaxAge: 80,
				Includes: models.StringArray{"Transportasi AC", "Guide/driver", "Air mineral", "Tiket masuk Bukit Merese"},
				Excludes: models.StringArray{"Makan dan minum", "Pengeluaran pribadi", "Tips driver"},
				Equipment: models.StringArray{"Kamera", "Topi", "Tabir surya"},
				Requirements: "Cocok untuk semua usia. Berjalan ringan di Bukit Merese.",
				CancellationPolicy: "Pembatalan >24 jam: refund 100%. <24 jam: reschedule sesuai ketersediaan.",
				SeoTitle: "Mandalika & Kuta Sunset Tour | Rinjani Travel",
				SeoDescription: "Tur setengah hari Sirkuit Mandalika, Pantai Kuta, dan sunset Bukit Merese.",
			},
			Itineraries: []seedItinerary{{1, "Mandalika & Kuta Sunset", "Penjemputan sore, foto di Sirkuit Mandalika, waktu bebas di Pantai Kuta, sunset di Bukit Merese, kembali ke hotel.", "-", "-"}},
			Addons: []seedAddon{{"Private Tour", "Kendaraan privat.", 350000, "per_booking"}},
			FAQs: []seedFAQ{{"Apakah bisa menjemput di Bandara?", "Bisa, dengan biaya tambahan sesuai lokasi. Hubungi tim kami sebelum memesan."}},
		},
	}

	for _, seed := range packages {
		var existing models.Package
		if err := db.Where("slug = ?", seed.Package.Slug).First(&existing).Error; err == nil {
			continue
		}
		pkg := seed.Package
		pkg.Itineraries = make([]models.PackageItinerary, 0, len(seed.Itineraries))
		for _, item := range seed.Itineraries {
			pkg.Itineraries = append(pkg.Itineraries, models.PackageItinerary{
				DayNumber: item.Day, Title: item.Title, Description: item.Description,
				Meals: item.Meals, Accommodation: item.Stay, SortOrder: item.Day,
			})
		}
		pkg.Addons = make([]models.PackageAddon, 0, len(seed.Addons))
		for i, item := range seed.Addons {
			pkg.Addons = append(pkg.Addons, models.PackageAddon{
				Name: item.Name, Description: item.Description, Price: item.Price,
				PricingType: item.PricingType, Active: true, SortOrder: i,
			})
		}
		pkg.FAQs = make([]models.PackageFAQ, 0, len(seed.FAQs))
		for i, item := range seed.FAQs {
			pkg.FAQs = append(pkg.FAQs, models.PackageFAQ{Question: item.Question, Answer: item.Answer, SortOrder: i})
		}
		if err := db.Create(&pkg).Error; err != nil {
			return fmt.Errorf("seed package %s: %w", pkg.Slug, err)
		}
	}
	log.Println("✓ Packages seeded")
	return nil
}

func SeedDepartures(db *gorm.DB) error {
	var packages []models.Package
	if err := db.Where("status = ?", "published").Find(&packages).Error; err != nil {
		return err
	}
	today := time.Now()
	for _, pkg := range packages {
		var count int64
		db.Model(&models.PackageDeparture{}).Where("package_id = ?", pkg.ID).Count(&count)
		if count > 0 {
			continue
		}
		// Two departures per week for the next 14 weeks, with a realistic mix
		// of open, full, and closed dates.
		for week := 0; week < 14; week++ {
			for _, offset := range []int{3, 6} {
				start := today.AddDate(0, 0, week*7+offset)
				if start.Before(today) {
					continue
				}
				capacity := 16
				if pkg.Category == "trekking" {
					capacity = 12
				}
				reserved := 0
				status := "open"
				if week%5 == 0 && offset == 6 {
					reserved = capacity
					status = "full"
				}
				if week%7 == 0 && offset == 3 {
					status = "closed"
				}
				dep := models.PackageDeparture{
					PackageID: pkg.ID,
					StartDate: models.NewDate(start),
					EndDate:   models.NewDate(start.AddDate(0, 0, maxInt(pkg.Days, 1)-1)),
					Capacity:  capacity,
					ReservedCount: reserved,
					BookingCutoff: models.NewDate(start.AddDate(0, 0, -3)),
					Status:    status,
					GuideName: "Guide Rinjani Travel",
				}
				if week == 2 && offset == 3 {
					override := pkg.BasePrice + 250000
					dep.PriceOverride = &override
				}
				if err := db.Create(&dep).Error; err != nil {
					return err
				}
			}
		}
	}
	log.Println("✓ Departures seeded")
	return nil
}

func SeedCoupons(db *gorm.DB) error {
	now := time.Now()
	start := now.AddDate(0, 0, -1)
	end := now.AddDate(1, 0, 0)
	coupons := []models.Coupon{
		{Code: "RINJANI10", Description: "Diskon 10% untuk semua paket, maksimal Rp500.000.", Type: "percent", Value: 10, MinSpend: 1000000, MaxDiscount: 500000, UsageLimit: 200, StartsAt: &start, EndsAt: &end, Active: true},
		{Code: "EARLYBIRD", Description: "Potongan Rp200.000 untuk pemesanan awal.", Type: "fixed", Value: 200000, MinSpend: 1500000, UsageLimit: 100, StartsAt: &start, EndsAt: &end, Active: true},
		{Code: "GROUP5", Description: "Diskon 15% untuk grup minimal 5 peserta.", Type: "percent", Value: 15, MinSpend: 5000000, MaxDiscount: 1000000, UsageLimit: 50, StartsAt: &start, EndsAt: &end, Active: true},
	}
	for _, coupon := range coupons {
		record := models.Coupon{Code: coupon.Code}
		if err := db.Where("code = ?", coupon.Code).Assign(coupon).FirstOrCreate(&record).Error; err != nil {
			return err
		}
	}
	return nil
}

func SeedFAQs(db *gorm.DB) error {
	var count int64
	db.Model(&models.FAQ{}).Count(&count)
	if count > 0 {
		return nil
	}
	faqs := []models.FAQ{
		{Question: "Bagaimana cara memesan paket?", Answer: "Pilih paket, tentukan tanggal keberangkatan dan jumlah peserta, lalu isi data peserta dan lakukan pembayaran. Kuota ditahan selama 30 menit.", Category: "pemesanan", SortOrder: 1, Published: true},
		{Question: "Metode pembayaran apa yang tersedia?", Answer: "Kami mendukung transfer bank/VA, e-wallet, kartu, dan QRIS melalui payment gateway resmi. Konfirmasi pembayaran diverifikasi otomatis melalui webhook.", Category: "pembayaran", SortOrder: 2, Published: true},
		{Question: "Apakah harga sudah termasuk tiket taman nasional?", Answer: "Ya, untuk paket trekking Rinjani tiket masuk Taman Nasional sudah termasuk kecuali dinyatakan lain pada bagian 'tidak termasuk'.", Category: "paket", SortOrder: 3, Published: true},
		{Question: "Bagaimana kebijakan pembatalan?", Answer: "Pembatalan lebih dari 14 hari sebelum keberangkatan mendapat refund 100% dikurangi biaya admin. Pembatalan 7-14 hari mendapat refund 50%. Kurang dari 7 hari dapat mengajukan reschedule sesuai ketersediaan.", Category: "pembatalan", SortOrder: 4, Published: true},
		{Question: "Apakah saya perlu berpengalaman mendaki?", Answer: "Tergantung paket. Paket crater rim cocok untuk pemula aktif, sedangkan paket summit membutuhkan kebugaran dan pengalaman mendaki.", Category: "paket", SortOrder: 5, Published: true},
		{Question: "Apakah data kesehatan saya aman?", Answer: "Data kesehatan hanya dikumpulkan bila diperlukan untuk keselamatan, aksesnya dibatasi pada tim operasional, dan tidak dibagikan tanpa persetujuan Anda.", Category: "privasi", SortOrder: 6, Published: true},
	}
	return db.Create(&faqs).Error
}

func SeedDemoReviews(db *gorm.DB) error {
	var customer models.User
	if err := db.Where("email = ?", "customer@example.com").First(&customer).Error; err != nil {
		return nil
	}
	var pkg models.Package
	if err := db.Where("slug = ?", "rinjani-summit-trekking-4d3n-sembalun").First(&pkg).Error; err != nil {
		return nil
	}
	// Create a past departure and completed bookings so reviews satisfy the
	// "review only after completed booking" business rule.
	pastStart := models.NewDate(time.Now().AddDate(0, -2, 0))
	var pastDep models.PackageDeparture
	if err := db.Where("package_id = ? AND start_date = ?", pkg.ID, pastStart.String()).First(&pastDep).Error; err != nil {
		pastDep = models.PackageDeparture{
			PackageID: pkg.ID, StartDate: pastStart, EndDate: pastStart.AddDate(0, 0, 3),
			Capacity: 12, ReservedCount: 0, BookingCutoff: pastStart.AddDate(0, 0, -3), Status: "closed",
		}
		if err := db.Create(&pastDep).Error; err != nil {
			return err
		}
	}
	reviews := []struct {
		Code    string
		Rating  int
		Title   string
		Content string
	}{
		{"DEMO-REVIEW-001", 5, "Pengalaman trekking terbaik", "Guide sangat profesional, makanan enak, dan panorama puncak Rinjani luar biasa. Semua perlengkapan disiapkan dengan baik."},
		{"DEMO-REVIEW-002", 5, "Tim yang peduli keselamatan", "Cuaca sempat buruk, tetapi guide mengambil keputusan tepat dan tetap membuat perjalanan menyenangkan. Highly recommended."},
		{"DEMO-REVIEW-003", 4, "Trip yang terorganisir", "Penjemputan tepat waktu dan itinerary jelas. Porter sangat membantu. Satu saran: tambahkan pilihan menu vegetarian."},
	}
	for _, item := range reviews {
		var existing models.Booking
		if err := db.Where("booking_code = ?", item.Code).First(&existing).Error; err == nil {
			continue
		}
		booking := models.Booking{
			BookingCode: item.Code, UserID: customer.ID, DepartureID: pastDep.ID,
			Status: models.BookingCompleted, Subtotal: pkg.BasePrice, Total: pkg.BasePrice,
			Currency: "IDR", NumberOfTravelers: 1, OrganizerName: customer.Name,
			OrganizerPhone: customer.Phone, OrganizerEmail: customer.Email,
			ConsentAt: timePtr(time.Now().AddDate(0, -2, -5)),
			CompletedAt: timePtr(time.Now().AddDate(0, -2, 4)),
			CreatedAt: time.Now().AddDate(0, -2, -7), UpdatedAt: time.Now().AddDate(0, -2, 4),
		}
		if err := db.Create(&booking).Error; err != nil {
			return err
		}
		_ = db.Create(&models.BookingTraveler{
			BookingID: booking.ID, Name: customer.Name, Nationality: "Indonesia",
			EmergencyContactName: "Keluarga", EmergencyContactPhone: customer.Phone, IsOrganizer: true,
		}).Error
		now := time.Now().AddDate(0, -2, 4)
		review := models.Review{
			BookingID: booking.ID, PackageID: pkg.ID, UserID: customer.ID,
			Rating: item.Rating, Title: item.Title, Content: item.Content,
			Status: "published", PublishedAt: &now,
		}
		if err := db.Create(&review).Error; err != nil {
			return err
		}
	}
	log.Println("✓ Demo reviews seeded")
	return nil
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func timePtr(t time.Time) *time.Time { return &t }
