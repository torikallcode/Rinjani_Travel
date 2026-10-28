# PRD — Rinjani Travel

**Versi:** 1.0  
**Status:** Draft untuk implementasi  
**Tanggal:** 16 Oktober 2026  
**Produk:** Situs pemesanan perjalanan dan trekking Lombok/Rinjani untuk publik, dengan panel administrasi internal.

## 1. Ringkasan produk

Rinjani Travel adalah platform pemesanan langsung (direct booking) untuk paket trekking Gunung Rinjani dan wisata Lombok. Pengunjung dapat mencari paket, melihat jadwal serta ketersediaan, memesan dan membayar secara aman, lalu mengelola pesanan mereka. Tim operasional mengelola paket, kuota keberangkatan, booking, pembayaran, pelanggan, konten, dan laporan melalui admin dashboard.

Produk bukan marketplace multi-vendor pada tahap awal. Rinjani Travel bertindak sebagai satu operator/agen yang menjual inventaris paketnya sendiri. Ruang lingkup ini menjaga alur operasional dan pembayaran tetap dapat dikendalikan.

## 2. Kondisi saat ini

- Frontend: React 18 + Vite, React Router, Tailwind/DaisyUI, dengan aset lokal.
- Halaman publik yang sudah ada: beranda, tour, trekking, detail paket, galeri, tentang, dan kontak.
- Data paket saat ini disimpan statis di `src/data/DataTour.jsx` dan `src/data/DataTracking.jsx`.
- Form booking saat ini mengirim template pesan ke WhatsApp; belum ada akun pengguna, database, validasi server, inventaris kuota, pembayaran, atau admin panel.

PRD ini menjadi acuan untuk memigrasikan pengalaman demo tersebut ke aplikasi produksi tanpa menghilangkan identitas visual Rinjani/Lombok yang sudah ada.

## 3. Tujuan dan metrik keberhasilan

### Tujuan bisnis

1. Mengubah pengunjung menjadi booking yang dapat dilacak dari awal sampai selesai.
2. Mengurangi pekerjaan manual admin untuk memeriksa kuota, pembayaran, dan data peserta.
3. Membangun kepercayaan melalui informasi paket, keselamatan, harga, kebijakan, dan status pemesanan yang jelas.

### Metrik MVP (diukur 90 hari setelah peluncuran)

| Metrik | Target awal |
| --- | --- |
| Booking berhasil dibuat | ≥ 3% dari sesi halaman detail paket |
| Pembayaran berhasil | ≥ 70% dari booking yang dibuat |
| Waktu respons booking oleh admin | < 2 jam pada jam operasional |
| Kegagalan webhook pembayaran yang tidak tertangani | 0 |
| Core Web Vitals | LCP < 2,5 dtk pada koneksi umum mobile |

## 4. Pengguna dan peran

| Peran | Kebutuhan utama | Hak akses |
| --- | --- | --- |
| Pengunjung | Menjelajah dan membandingkan paket | Baca konten publik, kirim pertanyaan |
| Pelanggan | Memesan dan memantau perjalanan | Akun sendiri, booking sendiri, pembayaran, dokumen peserta |
| Admin operasional | Memproses pesanan dan keberangkatan | Booking, peserta, jadwal, pembayaran, komunikasi |
| Admin konten | Menjaga katalog dan halaman publik | Paket, media, FAQ, artikel, promo |
| Super admin | Mengatur bisnis dan akses | Semua modul, peran pengguna, konfigurasi, audit log |

Gunakan RBAC (role-based access control); jangan membedakan akses hanya di sisi frontend.

## 5. Alur utama pelanggan

```text
Beranda / pencarian
  → daftar paket + filter
  → detail paket & tanggal keberangkatan
  → pilih tanggal, jumlah peserta, add-on
  → isi data pemesan dan peserta
  → ringkasan harga + setujui kebijakan
  → buat booking (kuota ditahan sementara)
  → bayar melalui payment gateway
  → pembayaran terverifikasi via webhook
  → konfirmasi & voucher/email/WhatsApp
  → pelanggan mengelola data peserta dan dokumen
  → perjalanan selesai → ulasan
```

### Status booking

`draft → pending_payment → paid → confirmed → completed`

Status pengecualian: `payment_expired`, `cancelled`, `refunded`, `on_hold`.

Status tidak boleh diubah sembarang dari UI. Semua transisi tervalidasi di backend dan dicatat pada riwayat booking.

## 6. Ruang lingkup MVP

### 6.1 Situs publik

- Beranda dengan value proposition, paket unggulan, testimoni, jaminan keselamatan, CTA, dan kontak cepat.
- Katalog paket `/packages`: pencarian, filter kategori (trekking/tour), durasi, harga, level kesulitan, titik keberangkatan, dan tanggal.
- Detail paket dengan galeri, itinerary harian, fasilitas termasuk/tidak termasuk, harga mulai dari, syarat fisik, daftar perlengkapan, kebijakan pembatalan, FAQ, ulasan, dan CTA booking.
- Kalender keberangkatan dengan kuota tersedia, penuh, dan tanggal ditutup.
- Halaman statis: tentang kami, kontak, galeri, kebijakan privasi, syarat layanan, kebijakan pembatalan, keselamatan, dan FAQ.
- SEO dasar: URL slug, metadata per paket, sitemap, robots, Open Graph, schema.org `TouristTrip`/`Product`/`FAQPage` bila relevan.
- Bahasa Indonesia sebagai default; struktur siap untuk Bahasa Inggris pada fase berikutnya.

### 6.2 Akun pelanggan

- Registrasi/login email + kata sandi, verifikasi email, lupa dan reset kata sandi.
- Profil pemesan: nama, email, telepon/WhatsApp, negara, kontak darurat.
- Dashboard: daftar booking, detail/voucher, status pembayaran, status perjalanan, dan tombol hubungi dukungan.
- Data peserta: identitas minimum yang diperlukan, tanggal lahir, jenis kelamin bila diperlukan untuk operasional, alergi/kondisi medis secara eksplisit dan dengan persetujuan.

### 6.3 Checkout dan pembayaran

- Pilih tanggal, peserta, tipe paket, dan add-on (misalnya private trip, transfer, sewa perlengkapan) bila tersedia.
- Harga dihitung di server: harga per orang, diskon/promo, add-on, pajak/biaya, deposit atau pelunasan, mata uang IDR.
- Validasi kuota secara atomik; pemesanan menahan kuota selama periode pembayaran yang ditentukan.
- Integrasi satu payment gateway Indonesia yang mendukung VA, e-wallet, kartu, dan QRIS (pilihan vendor diputuskan sebelum implementasi).
- Konfirmasi pembayaran hanya dari webhook gateway yang diverifikasi, bukan dari return URL browser.
- Nomor invoice unik, bukti pembayaran, tanggal kedaluwarsa, refund/manual payment record jika diperlukan.
- Email transaksi wajib; notifikasi WhatsApp dapat ditambahkan setelah template dan provider resmi tersedia.

### 6.4 Admin dashboard

- Login admin terpisah atau area terlindung di `/admin` dengan RBAC.
- Dashboard: booking hari ini, pendapatan, pembayaran menunggu, keberangkatan mendatang, okupansi, dan tugas yang perlu ditindaklanjuti.
- CRUD paket, kategori, itinerary, harga, fasilitas, galeri, FAQ, SEO, status publikasi, dan add-on.
- CRUD jadwal keberangkatan: tanggal, kapasitas, harga khusus, cut-off, status buka/tutup, guide/porter opsional.
- Manajemen booking: filter, pencarian, detail peserta, catatan internal, perubahan status terkontrol, kirim ulang invoice/voucher, ekspor CSV.
- Manajemen pembayaran: status gateway, rekonsiliasi, refund request, riwayat webhook yang dapat diaudit.
- Manajemen pelanggan, kupon/promo sederhana, ulasan (moderasi), dan konten halaman/FAQ.
- Manajemen staf dan role, audit log untuk aksi penting.

## 7. Aturan bisnis inti

1. Hanya jadwal berstatus `open`, belum melewati cut-off, dan memiliki kuota cukup yang dapat dibooking.
2. Harga booking disalin sebagai snapshot saat checkout; perubahan harga paket tidak mengubah invoice lama.
3. Kuota dikurangi hanya setelah booking dibuat dan dikembalikan otomatis ketika pembayaran kedaluwarsa/dibatalkan sesuai aturan.
4. Pembayaran dianggap sah hanya setelah verifikasi signature webhook dan pencocokan nominal, mata uang, dan invoice.
5. Pembatalan, refund, dan reschedule mengikuti kebijakan yang tampil dan disetujui pelanggan saat checkout; keputusan operasional terekam.
6. Review hanya dapat dibuat oleh pelanggan dengan booking `completed`.
7. Data kesehatan/minor diperlakukan sebagai data sensitif: kumpulkan seminimal mungkin, batasi akses, dan tetapkan retensi data.

## 8. Model data minimum

| Entitas | Field penting |
| --- | --- |
| `users` | id, name, email, phone, password_hash, role, email_verified_at |
| `packages` | id, slug, title, category, description, difficulty, duration, base_price, currency, status |
| `package_departures` | id, package_id, start_date, end_date, capacity, reserved_count, price_override, booking_cutoff, status |
| `package_addons` | id, package_id, name, price, pricing_type, active |
| `bookings` | id, booking_code, user_id, departure_id, status, subtotal, discount, tax, total, expires_at |
| `booking_travelers` | id, booking_id, name, birth_date, nationality, emergency_contact, health_note (restricted) |
| `booking_items` | id, booking_id, type, reference_id, name_snapshot, unit_price, quantity, total |
| `payments` | id, booking_id, provider, provider_reference, amount, status, paid_at, raw_event_reference |
| `coupons` | id, code, rule, value, usage_limit, starts_at, ends_at, active |
| `reviews` | id, booking_id, rating, content, status, published_at |
| `media` | id, owner_type, owner_id, storage_key, alt_text, sort_order |
| `audit_logs` | id, actor_id, action, entity_type, entity_id, before, after, created_at |

Gunakan database relasional (PostgreSQL) untuk konsistensi transaksi booking, pembayaran, dan kuota. File media disimpan di object storage; database hanya menyimpan metadata/URL terkelola.

## 9. Arsitektur yang disarankan

### Keputusan awal

- Pertahankan React sebagai frontend, tetapi pindahkan data dari file JSX statis ke API.
- Gunakan backend terpisah berbasis Golang (Gin)**atau** migrasikan bertahap ke framework full-stack React. Keputusan dipilih pada fase fondasi berdasarkan kapasitas tim.
- Mysql, ORM/migrasi terkelola, object storage kompatibel S3, dan layanan email transaksional.
- REST API terversi (`/api/v1`) sudah cukup untuk MVP; dokumentasikan dengan OpenAPI.
- Payment gateway dan WhatsApp/email ditempatkan di adapter/service layer agar vendor dapat diganti.

### Batas keamanan

```text
Browser publik/admin → HTTPS → API + autentikasi/RBAC → PostgreSQL
                                      ├→ Object storage (URL terbatas)
                                      ├→ Payment gateway
                                      └→ Email/WhatsApp provider

Payment gateway → endpoint webhook terverifikasi → payment & booking state machine
```

Rahasia API hanya berada pada environment server. Jangan pernah meletakkan secret payment gateway, kredensial storage, atau kunci WhatsApp di aplikasi Vite/browser.

## 10. Kebutuhan nonfungsional

- **Keamanan:** HTTPS, hash kata sandi modern, session/httpOnly cookie atau token dengan rotasi yang aman, CSRF protection bila memakai cookie, rate limiting, validasi input server, sanitasi output, RBAC backend, dan audit log.
- **Privasi:** halaman privasi dan consent yang jelas; minimisasi data; akses catatan kesehatan dibatasi; prosedur penghapusan/retensi data.
- **Keandalan:** backup database harian, monitoring error, alert webhook gagal, idempotency key pada endpoint checkout dan webhook, serta retry aman untuk notifikasi.
- **Aksesibilitas:** target WCAG 2.2 AA untuk form, navigasi keyboard, fokus modal, kontras, label, dan alt text.
- **Performa:** gambar WebP/AVIF responsif, lazy loading, kompresi, caching, dan target LCP mobile < 2,5 detik.
- **Observability:** log terstruktur dengan request/booking ID, error tracking, analytics yang menghormati consent, dan dashboard uptime.

## 11. Halaman dan rute target

| Area | Rute contoh |
| --- | --- |
| Publik | `/`, `/packages`, `/packages/:slug`, `/about`, `/gallery`, `/faq`, `/contact`, `/policies/*` |
| Checkout | `/checkout/:departureId`, `/booking/:bookingCode`, `/payment/return` |
| Pelanggan | `/account`, `/account/bookings/:bookingCode`, `/account/profile` |
| Admin | `/admin`, `/admin/bookings`, `/admin/departures`, `/admin/packages`, `/admin/payments`, `/admin/customers`, `/admin/content`, `/admin/settings` |

Rute detail saat ini berbasis `:id` dapat dialihkan ke `:slug` untuk URL yang lebih ramah SEO, dengan redirect dari URL lama selama masa transisi.

## 12. Fase implementasi

| Fase | Hasil | Prioritas |
| --- | --- | --- |
| 0. Discovery & fondasi | Brand/legal data, kebijakan, desain sistem, skema DB, environment, CI, backlog | Wajib |
| 1. Katalog publik | Refactor data ke API, halaman paket/detail, SEO, CMS admin dasar | Wajib |
| 2. Booking | akun, kalender/ketersediaan, checkout, hold kuota, dashboard pelanggan | Wajib |
| 3. Pembayaran & operasi | gateway + webhook, invoice, admin booking/payment/departure, notifikasi email | Wajib sebelum publik |
| 4. Go-live readiness | QA, UAT operasional, keamanan, backup, observability, legal pages, deployment | Wajib sebelum publik |
| 5. Pertumbuhan | promo kompleks, review, blog, multi-bahasa, WhatsApp resmi, analitik funnel | Setelah MVP |

### Urutan backlog teknis pertama

1. Bersihkan dan normalisasi data paket saat ini (nama, mata uang IDR, isi itinerary, gambar, fasilitas, kebijakan).
2. Tetapkan desain database, migration, seed data, dan kontrak API katalog.
3. Bangun autentikasi, RBAC, dan kerangka dashboard admin.
4. Migrasikan katalog publik ke API tanpa memutus halaman yang sudah ada.
5. Bangun departure, kuota, checkout, dan booking state machine.
6. Tambahkan gateway pembayaran + webhook yang idempoten, kemudian notifikasi.
7. Lakukan UAT dengan skenario booking, kuota bersamaan, pembayaran gagal/kedaluwarsa, refund, dan perubahan jadwal.

## 13. Kriteria penerimaan MVP

- Admin dapat membuat paket dan jadwal keberangkatan; perubahan tampil di situs publik tanpa deploy frontend.
- Pelanggan dapat memilih jadwal yang masih tersedia, memasukkan peserta, dan menerima nomor booking unik.
- Sistem menolak booking ketika kuota tidak cukup, termasuk saat dua pengguna checkout bersamaan.
- Total invoice dihitung ulang dan divalidasi di server; frontend tidak menentukan harga final.
- Pembayaran sukses melalui webhook mengubah booking secara idempoten menjadi `paid`/`confirmed` dan mengirim bukti transaksi.
- Pelanggan hanya dapat melihat booking miliknya; admin hanya dapat mengakses modul sesuai role.
- Admin dapat memfilter booking, melihat riwayat status/pembayaran, mengekspor daftar peserta, dan mencatat tindakan.
- Setiap halaman publik inti responsif, dapat dinavigasi keyboard, dan memiliki metadata SEO dasar.
- Tidak ada secret produksi pada repository atau bundle frontend; backup dan monitoring sudah diuji.

## 14. Di luar ruang lingkup MVP

- Marketplace multi-operator dan payout otomatis ke partner.
- Aplikasi mobile native.
- Dynamic pricing kompleks/AI recommendation.
- Integrasi sistem tiket taman nasional secara langsung.
- Multi-currency penuh dan multi-bahasa lengkap.
- Loyalty point, affiliate, dan live chat 24/7.

## 15. Keputusan yang diperlukan sebelum mulai coding

1. Nama badan usaha, alamat, nomor WhatsApp resmi, domain, dan identitas brand final.
2. Model pembayaran: deposit vs pelunasan penuh, tenggat pembayaran, refund/reschedule, pajak/biaya, dan mata uang tampilan.
3. Payment gateway serta akun bisnis yang akan digunakan.
4. Aturan paket: kapasitas, cut-off, harga per orang/private, add-on, dan data peserta wajib.
5. Provider hosting, database, object storage, email, serta akun produksi yang dimiliki organisasi.
6. Bahasa peluncuran (disarankan Indonesia + konten Inggris minimum untuk wisatawan internasional) dan prioritas konten legal.
7. Siapa yang menjadi owner operasional untuk konfirmasi booking, refund, dan pembaruan jadwal.

## 16. Risiko utama dan mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Overbooking | transaksi DB/locking atau conditional update untuk kuota, hold berakhir otomatis, UAT konkurensi |
| Status pembayaran salah | webhook signature, idempotency, rekonsiliasi, audit log; jangan percaya redirect browser |
| Konten/paket tidak akurat | owner konten, tanggal review, status draft/publish, checklist sebelum rilis |
| Kebocoran data pelanggan | least-privilege RBAC, enkripsi saat transit, retensi minim, secret management, monitoring |
| Gangguan cuaca/izin trekking | prosedur penutupan jadwal, notifikasi massal, pilihan reschedule/refund sesuai kebijakan |
| Ketergantungan vendor | adapter API, export data, backup, dokumentasi kredensial dan runbook |

## 17. Definition of Done sebelum situs publik

Situs hanya dianggap siap publik setelah semua kriteria MVP terpenuhi, kebijakan bisnis/legal disetujui, akun payment gateway produksi aktif, uji webhook dan refund selesai, data paket diverifikasi operator, akses admin diuji, backup/monitoring aktif, dan ada runbook untuk booking, pembayaran, pembatalan, perubahan jadwal, serta insiden keamanan.
