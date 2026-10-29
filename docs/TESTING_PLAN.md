# Rencana Pengujian (Test Plan) — Rinjani Travel

| Atribut | Nilai |
| --- | --- |
| Versi dokumen | 1.0 |
| Tanggal | 28 Oktober 2026 |
| Status | Rencana (belum dieksekusi) |
| Pemilik | QA Lead / Engineering Lead |
| Cakupan | Frontend React/Vite, Backend Go/Gin, MySQL, alur booking dan pembayaran mock, panel admin |
| Referensi | [`PRD.md`](../PRD.md), [`README.md`](../README.md), [`docs/RUNBOOK.md`](./RUNBOOK.md), [`backend/docs/openapi.yaml`](../backend/docs/openapi.yaml) |

> Dokumen ini adalah **rencana**, bukan laporan hasil. Setiap test case memiliki ID agar hasil eksekusi, bug, dan bukti uji dapat dilacak. Perbarui dokumen bila route, aturan bisnis, atau kontrak API berubah.

---

## 1. Tujuan pengujian

1. Memastikan alur bisnis utama (katalog → checkout → pembayaran → konfirmasi → kelola pesanan → ulasan) berjalan benar dari sisi pelanggan maupun admin.
2. Memverifikasi aturan kritis yang berisiko tinggi: kuota/overbooking, perhitungan harga di server, idempotensi booking dan webhook, serta transisi status booking.
3. Memverifikasi kontrol keamanan dan RBAC tidak hanya di UI, tetapi juga di API.
4. Memastikan kualitas non-fungsional: performa, aksesibilitas, responsivitas, SEO dasar, dan kesiapan operasional.
5. Menghasilkan bukti kelayakan rilis (go/no-go) sebelum staging/produksi.

## 2. Ruang lingkup

### 2.1 Termasuk dalam pengujian

- Situs publik: beranda, katalog paket, detail paket, kalender keberangkatan, galeri, tentang, FAQ, kontak, halaman kebijakan.
- Autentikasi pelanggan: registrasi, verifikasi email, login, lupa/reset kata sandi, profil, keamanan akun.
- Checkout: pemilihan jadwal, peserta, add-on, kupon, harga server, consent, pembuatan booking, hold kuota.
- Pembayaran: instruksi pembayaran mock, simulasi pembayaran (development), webhook HMAC, idempotensi, rekonsiliasi manual, refund.
- Dashboard pelanggan: daftar booking, detail, voucher, pembatalan, ulasan.
- Admin: dashboard, paket, jadwal, booking, pembayaran, pelanggan, kupon, ulasan, konten/FAQ, pesan, staf, pengaturan, audit log.
- API: envelope response, validasi, pagination, error handling, kontrak OpenAPI.
- Keamanan: autentikasi, otorisasi/RBAC, rate limiting, CORS, security headers, injeksi, kebocoran secret, IDOR.
- Non-fungsional: performa, aksesibilitas WCAG 2.2 AA, responsif, kompatibilitas browser, SEO dasar, observability, backup/restore.
- UAT operasional sesuai skenario di `docs/RUNBOOK.md`.

### 2.2 Tidak termasuk (fase ini)

- Sertifikasi resmi payment gateway produksi dan uji uang nyata.
- Pengiriman email/WhatsApp nyata ke provider eksternal (di development email hanya dicatat; verifikasi integrasi provider dilakukan saat go-live).
- Marketplace multi-vendor, multi-currency penuh, aplikasi mobile native, dynamic pricing/AI.
- Penetration test menyeluruh oleh pihak ketiga (rencana ini mencakup baseline keamanan, bukan pengganti pentest formal).
- Uji beban di luar target kapasitas awal (lihat bagian 8.11).
- Data pelanggan produksi. Semua pengujian memakai data sintetis.

## 3. Baseline pengujian saat ini

| Area | Kondisi saat ini | Gap yang perlu ditutup |
| --- | --- | --- |
| Backend unit test | Ada `backend/internal/services/rules_test.go` untuk transisi status, kupon, HMAC, dan verifikasi webhook. | Belum ada test handler, middleware, repository, dan service booking/payment secara menyeluruh. |
| Frontend unit/component test | Belum ada. | Tambahkan Vitest + React Testing Library untuk komponen/form kritis. |
| End-to-end test | Belum ada. | Tambahkan Playwright untuk alur kritis. |
| API contract test | Spesifikasi OpenAPI tersedia, belum ada validasi otomatis. | Tambahkan Schemathesis/Newman atau validasi kontrak di CI. |
| CI/CD | Belum ada workflow `.github/workflows`. | Jalankan lint, build, unit test, dan E2E smoke pada setiap PR. |
| Observability test | Request ID dan health endpoint tersedia. | Verifikasi log, alert webhook gagal, dan dashboard uptime di staging. |
| Data uji | Seeder demo tersedia. | Siapkan dataset khusus untuk kuota penuh, cut-off, kupon, dan hold kedaluwarsa. |

## 4. Strategi pengujian

### 4.1 Pendekatan

Gunakan piramida pengujian dengan penekanan pada otomasi level rendah, lalu E2E hanya untuk alur bernilai bisnis tinggi:

```text
        Manual UAT / eksplorasi
       /        E2E (Playwright)        \
      /     API contract & integration   \
     /   Unit test (Go, Vitest/RTL)       \
```

Prinsip:

- **Risk-based testing**: prioritas tertinggi pada uang, kuota, status booking, akses data, dan RBAC.
- **Shift-left**: unit/integration test dijalankan di setiap PR; E2E smoke sebelum merge ke branch utama.
- **Server adalah sumber kebenaran**: setiap perhitungan harga dan otorisasi diuji langsung di API, bukan hanya lewat UI.
- **Uji jalur negatif**: input tidak valid, akses tanpa hak, kuota habis, webhook palsu, timeout, dan kondisi batas.
- **Dapat diulang**: test data dan waktu dikontrol melalui environment variable, bukan menunggu 30 menit.

### 4.2 Definisi prioritas

| Prioritas | Arti | Contoh |
| --- | --- | --- |
| P0 | Blocker rilis; menyangkut uang, kuota, keamanan, atau data pelanggan | Overbooking, pembayaran ganda, IDOR, RBAC bocor |
| P1 | Alur utama terganggu dan tidak ada workaround wajar | Checkout gagal, webhook tidak memproses pembayaran valid |
| P2 | Fungsi penting tetapi ada workaround | Filter katalog salah, export CSV bermasalah |
| P3 | Kosmetik, konten, atau peningkatan | Typo, spacing, animasi |

### 4.3 Level pengujian

1. **Unit test** — fungsi murni dan aturan bisnis (`AllowedTransition`, `evaluateCoupon`, `SignPayload`, kalkulasi pajak, validasi tanggal).
2. **Integration test** — service + MySQL nyata (container sementara), termasuk transaksi dan row lock.
3. **API test** — seluruh endpoint `/api/v1` dengan autentikasi dan role berbeda.
4. **Component test** — form checkout, login, filter katalog, tabel admin.
5. **E2E test** — alur pelanggan dan admin dari browser.
6. **Manual exploratory/UAT** — skenario operasional, usability, dan edge case yang sulit diotomasi.
7. **Non-functional test** — performa, keamanan, aksesibilitas, kompatibilitas, SEO.

## 5. Lingkungan pengujian

### 5.1 Matriks lingkungan

| Lingkungan | Tujuan | Komponen | Catatan |
| --- | --- | --- | --- |
| Local dev | Unit, integration, E2E harian | Vite `:5173`, Go `:8000`, MySQL `:3306` | `SERVER_ENV=development`; endpoint simulasi pembayaran aktif. |
| Docker Compose | Smoke staging-like | Frontend `:8080`, backend `:8000`, MySQL `:3306` | `docker compose up --build`; volume DB persisten. |
| Staging | UAT, performa, keamanan | Sama dengan produksi, HTTPS | `SERVER_ENV=production`; simulasi pembayaran harus tertutup; gateway sandbox. |
| Produksi | Hanya verifikasi pascadeploy | Infrastruktur produksi | Tidak boleh menjalankan uji destruktif atau reset database. |

### 5.2 Konfigurasi uji khusus

| Variabel | Nilai uji | Tujuan |
| --- | --- | --- |
| `BOOKING_HOLD_MINUTES` | `1` | Uji expiry cepat tanpa menunggu 30 menit. |
| `TAX_PERCENT` | `0`, lalu `11` | Verifikasi perhitungan pajak dan pembulatan. |
| `RATE_LIMIT_PER_MINUTE` | `60` (default), lalu `3` | Verifikasi 429 dan header rate limit. |
| `SERVER_ENV` | `development` / `production` | Verifikasi endpoint dev dan perilaku produksi. |
| `ALLOWED_ORIGINS` | Origin uji saja | Verifikasi CORS produksi. |
| `PAYMENT_GATEWAY_SECRET` | Secret uji acak | Verifikasi signature webhook. |
| `JWT_SECRET` | Secret uji acak | Verifikasi token; jangan memakai secret produksi. |

### 5.3 Data uji

Akun demo (dari README):

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Super Admin | `superadmin@rinjanitravel.com` | `Admin123!` |
| Admin Operasional | `ops@rinjanitravel.com` | `Admin123!` |
| Admin Konten | `content@rinjanitravel.com` | `Admin123!` |
| Pelanggan | `customer@example.com` | `Customer123!` |

Data paket dan kupon hasil seeder:

- Paket trekking: `rinjani-summit-trekking-4d3n-sembalun`, `rinjani-crater-rim-3d2n-senaru`, `rinjani-lake-summit-5d4n`.
- Paket tour: `gili-islands-hopping-day-tour`, `lombok-waterfall-sasak-village-tour`, `pink-beach-snorkeling-day-trip`, `mandalika-kuta-sunset-tour`.
- Kupon: `RINJANI10` (persen, min. belanja Rp1.000.000, maks. Rp500.000), `EARLYBIRD` (potongan Rp200.000, min. Rp1.500.000), `GROUP5` (15%, min. Rp5.000.000, maks. Rp1.000.000).

Dataset tambahan yang wajib dibuat di environment uji:

| Dataset | Tujuan |
| --- | --- |
| Jadwal `open` dengan sisa 1 kursi | Uji batas kuota dan konkurensi. |
| Jadwal `full` (reserved = capacity) | Uji penolakan booking. |
| Jadwal `closed` | Uji penolakan booking. |
| Jadwal dengan `booking_cutoff` sudah lewat | Uji cut-off. |
| Jadwal dengan `price_override` | Uji harga khusus dan snapshot harga. |
| Paket `draft` | Uji paket tidak tampil publik dan tidak bisa dibooking. |
| Booking `completed` milik pelanggan uji | Uji ulasan. |
| Booking milik pelanggan lain | Uji IDOR. |
| Kupon tidak aktif, kedaluwarsa, belum mulai, dan sudah mencapai usage limit | Uji aturan kupon. |

Aturan data:

- Gunakan email unik per run, misalnya `qa+<timestamp>@example.com`.
- Data kesehatan harus sintetis dan tidak boleh berisi data pribadi nyata.
- Untuk reset environment lokal/staging: `docker compose down -v` lalu `docker compose up --build`. **Jangan lakukan di produksi.**
- Catat ID jadwal, kode booking, dan referensi pembayaran pada log eksekusi agar dapat ditelusuri.

### 5.4 Perangkat dan browser

| Kategori | Target |
| --- | --- |
| Desktop | Chrome/Edge versi terbaru, Firefox versi terbaru, Safari (bila tersedia) |
| Mobile | Android Chrome, iOS Safari; viewport 360, 390, 414 px |
| Tablet | 768 px dan 1024 px |
| Jaringan | Fast 3G throttling untuk uji LCP; offline untuk uji error state |
| Tools | Playwright, Postman/Newman, k6, OWASP ZAP baseline, axe DevTools, Lighthouse, `go test`, Vitest, ESLint |

## 6. Matriks cakupan dan risiko

| Modul | Risiko | Level uji | Otomasi |
| --- | --- | --- | --- |
| Katalog publik | Konten/harga salah, paket draft bocor | API, E2E, manual | Ya (API + E2E smoke) |
| Autentikasi | Akun takeover, enumerasi email, token bocor | API, E2E, keamanan | Sebagian |
| Checkout & kuota | Overbooking, harga dimanipulasi | Integration, API, konkurensi | Ya (prioritas) |
| Pembayaran | Pembayaran ganda, webhook palsu, status salah | Integration, API, keamanan | Ya (prioritas) |
| Akun pelanggan | IDOR, data peserta/health bocor | API, E2E, keamanan | Ya |
| Admin & RBAC | Eskalasi hak akses, perubahan status liar | API, E2E, manual | Ya (matriks role) |
| Konten & pesan | XSS, konten tidak sinkron | API, manual | Sebagian |
| Non-fungsional | Lambat, tidak aksesibel, tidak SEO-friendly | Lighthouse, axe, k6, manual | Sebagian |

## 7. Skenario uji

Kolom **P** adalah prioritas. Kolom **Langkah kunci** diringkas; langkah detail dan bukti dicatat pada test management sheet saat eksekusi.

### 7.1 Smoke test (dilakukan setiap build/deploy)

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-SMK-01 | P0 | API hidup | `GET /api/v1/health` | HTTP 200, `status: ok`, koneksi DB sehat, ada `time`. |
| TC-SMK-02 | P0 | Frontend tampil | Buka `/` dan `/packages` | Halaman render tanpa blank screen dan tanpa error console kritis. |
| TC-SMK-03 | P0 | Login demo | Login sebagai pelanggan dan super admin | Redirect ke halaman yang benar; token tersimpan; menu sesuai role. |
| TC-SMK-04 | P0 | Alur booking dasar | Pilih paket → jadwal → checkout → buat booking | Booking dibuat dengan kode unik dan status `pending_payment`. |
| TC-SMK-05 | P0 | Simulasi pembayaran | Buat pembayaran → simulasi (development) | Status menjadi `paid` lalu `confirmed`; kuota tetap terpakai. |

### 7.2 Situs publik

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-PUB-01 | P1 | Beranda | Buka `/` | Value proposition, paket unggulan, testimoni/ulasan, CTA, dan kontak tampil dari API; tidak ada data hardcoded yang usang. |
| TC-PUB-02 | P1 | Navigasi publik | Klik seluruh menu header/footer | Semua rute publik terbuka tanpa 404 yang tidak disengaja. |
| TC-PUB-03 | P1 | Daftar paket default | Buka `/packages` | Hanya paket `published` yang tampil; urutan default (featured lalu terbaru) konsisten; harga dan durasi terformat IDR. |
| TC-PUB-04 | P1 | Filter katalog | Terapkan `category`, `difficulty`, `min_price`, `max_price`, `duration`, `departure_point`, `date`, `featured`, dan `sort` | Hasil sesuai filter; filter dapat dikombinasikan; reset filter mengembalikan daftar awal. |
| TC-PUB-05 | P2 | Pencarian | Cari kata di judul, deskripsi, dan titik keberangkatan; cari kata tidak ada | Hasil relevan; empty state informatif; tidak error saat query kosong/spasi. |
| TC-PUB-06 | P2 | Pagination | Pindah halaman, ubah page size, akses halaman melebihi total | Data dan metadata `total`, `page`, `page_size`, `total_pages` konsisten; tidak ada duplikasi item. |
| TC-PUB-07 | P1 | Detail paket | Buka `/packages/:slug` | Galeri, itinerary, include/exclude, add-on, harga, kebijakan, FAQ, ulasan, dan kalender tampil lengkap. |
| TC-PUB-08 | P1 | Slug tidak ditemukan | Buka `/packages/slug-tidak-ada` | Halaman 404 yang ramah, bukan blank/stack trace; status API 404. |
| TC-PUB-09 | P0 | Status kalender | Buka paket dengan jadwal open, full, closed, cut-off lewat, dan tanggal lampau | Hanya jadwal `open`, belum cut-off, dan kuota cukup yang dapat dipilih; status lain tampil jelas dan nonaktif. |
| TC-PUB-10 | P1 | CTA booking tanpa login | Klik "Pesan" saat belum login | Diarahkan ke login; setelah login kembali ke checkout paket/jadwal yang dipilih. |
| TC-PUB-11 | P2 | Halaman statis | Buka `/about`, `/faq`, `/gallery`, `/terms`, `/privacy`, `/cancellation`, `/safety`, `/contact` | Konten dari API tampil, format HTML aman, dan tidak ada link rusak. |
| TC-PUB-12 | P2 | Galeri | Buka `/gallery`, buka gambar/lightbox | Gambar termuat, alt text tersedia, navigasi keyboard berfungsi, tidak ada layout shift berlebihan. |
| TC-PUB-13 | P2 | Tema terang/gelap | Ganti tema dari header | Tema berubah, tersimpan di `localStorage` (`rinjani_theme`), bertahan setelah refresh, mengikuti preferensi sistem pada kunjungan pertama. |
| TC-PUB-14 | P2 | 404 global | Buka URL acak | Halaman 404 tampil dengan tautan kembali ke beranda/katalog. |
| TC-PUB-15 | P2 | Responsif publik | Uji 360, 390, 768, 1024, dan 1440 px | Tidak ada horizontal scroll, teks terpotong, atau tombol tidak dapat dijangkau. |
| TC-PUB-16 | P2 | Metadata SEO | Periksa title, meta description, canonical, Open Graph pada beranda dan detail paket | Metadata unik dan relevan; canonical benar; tidak ada metadata ganda. |

### 7.3 Autentikasi dan akun dasar

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-AUTH-01 | P0 | Registrasi valid | Isi nama, email baru, telepon, negara, kata sandi ≥8 karakter | Akun dibuat sebagai `customer`; respons sukses; token verifikasi tersedia di development; email verifikasi tercatat. |
| TC-AUTH-02 | P1 | Registrasi email duplikat | Daftar dengan email yang sudah ada (beda kapitalisasi) | Ditolak dengan pesan jelas; tidak membuat akun ganda. |
| TC-AUTH-03 | P1 | Validasi registrasi | Nama 1 karakter, email invalid, telepon <8, kata sandi <8, field kosong | Validasi gagal di klien dan server; tidak ada data tersimpan. |
| TC-AUTH-04 | P1 | Verifikasi email | Buka tautan verifikasi; gunakan token dua kali; gunakan token palsu | Verifikasi pertama sukses; token tidak dapat dipakai ulang; token palsu ditolak. |
| TC-AUTH-05 | P0 | Login valid | Login pelanggan dan tiap role admin | Token dikembalikan; redirect sesuai role; data user tidak memuat password hash. |
| TC-AUTH-06 | P0 | Login gagal | Kata sandi salah, email tidak terdaftar, akun nonaktif | Pesan generik untuk kredensial salah; akun nonaktif ditolak; tidak ada token. |
| TC-AUTH-07 | P1 | Lupa kata sandi | Kirim email terdaftar dan tidak terdaftar | Respons selalu generik (tidak membocorkan keberadaan akun); email reset hanya untuk akun valid. |
| TC-AUTH-08 | P1 | Reset kata sandi | Gunakan token valid; token kedaluwarsa; token dipakai ulang; kata sandi baru lemah | Hanya token valid yang berhasil; token sekali pakai; validasi kata sandi berlaku. |
| TC-AUTH-09 | P0 | Proteksi rute | Akses `/account`, `/checkout/:slug`, `/admin` tanpa login | Diarahkan ke login; tidak ada data sensitif yang dirender sebelum autentikasi. |
| TC-AUTH-10 | P1 | Logout | Klik logout | Token dan data user dihapus dari `localStorage`; kembali ke halaman publik; tombol back tidak menampilkan data akun. |
| TC-AUTH-11 | P0 | Token rusak/kedaluwarsa | Ubah token, gunakan token `alg=none`, tunggu/expire token | API menolak 401; frontend membersihkan sesi dan mengarahkan ke login. |
| TC-AUTH-12 | P1 | Ubah kata sandi | Ubah dengan kata sandi lama benar/salah | Berhasil hanya bila kata sandi lama benar; sesi berikutnya memakai kata sandi baru. |
| TC-AUTH-13 | P1 | Rate limit autentikasi | Lakukan >10 percobaan login/daftar per menit dari IP yang sama | HTTP 429 dengan `Retry-After`; tidak membocorkan detail internal. |
| TC-AUTH-14 | P2 | Persistensi sesi | Refresh halaman setelah login | Sesi tetap aktif sampai token kedaluwarsa; tema dan data user tetap konsisten. |

### 7.4 Checkout dan booking

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-BOOK-01 | P0 | Quote server | `POST /bookings/quote` dengan `departure_id` dan peserta | Harga per orang, subtotal, diskon, pajak, total, sisa kursi, dan `hold_minutes` dihitung server. |
| TC-BOOK-02 | P1 | Add-on | Pilih add-on `per_person` dan `per_booking` dengan berbagai kuantitas | Total add-on benar; kuantitas `per_person` tidak melebihi jumlah peserta; add-on paket lain ditolak. |
| TC-BOOK-03 | P1 | Kupon valid | Terapkan `RINJANI10`, `EARLYBIRD`, `GROUP5` sesuai min. belanja | Diskon benar; batas maksimum diskon dihormati; total akhir benar. |
| TC-BOOK-04 | P1 | Kupon tidak valid | Kupon salah, nonaktif, belum mulai, kedaluwarsa, min. belanja kurang, usage limit habis | Ditolak dengan pesan spesifik; tidak ada booking yang dibuat. |
| TC-BOOK-05 | P1 | Pajak | Set `TAX_PERCENT=11`, hitung quote | Pajak dihitung dari subtotal setelah diskon; pembulatan konsisten; total = subtotal − diskon + pajak. |
| TC-BOOK-06 | P0 | Manipulasi harga | Ubah harga/total di payload atau localStorage | Server mengabaikan nilai klien dan memakai harga database; total invoice tidak berubah. |
| TC-BOOK-07 | P1 | Consent | Buat booking tanpa menyetujui kebijakan | Ditolak; consent wajib dicatat untuk booking yang berhasil. |
| TC-BOOK-08 | P0 | Buat booking valid | Isi data pemesan dan seluruh peserta, setujui kebijakan, submit | Booking dibuat dengan kode unik, status `pending_payment`, `expires_at` sesuai hold, item dan peserta tersimpan. |
| TC-BOOK-09 | P0 | Idempotensi booking | Kirim dua request `POST /bookings` dengan `Idempotency-Key` sama | Hanya satu booking dibuat; respons kedua mengembalikan booking yang sama, bukan duplikat. |
| TC-BOOK-10 | P1 | Batas peserta | Quote/booking dengan 0, 1, 30, dan 31 peserta | 1–30 diterima; 0 dan >30 ditolak dengan pesan jelas. |
| TC-BOOK-11 | P0 | Kuota tidak cukup | Booking melebihi `seats_left` | HTTP 409; tidak ada booking; `reserved_count` tidak berubah. |
| TC-BOOK-12 | P0 | Jadwal tidak dapat dibooking | Coba jadwal full, closed, cut-off lewat, tanggal lampau, dan paket draft | Semua ditolak dengan alasan yang sesuai; tidak ada kuota yang terpakai. |
| TC-BOOK-13 | P0 | Konkurensi kuota | 20–50 request paralel untuk jadwal sisa 1–5 kursi | Jumlah booking sukses tidak melebihi kuota; tidak ada `reserved_count > capacity`; respons gagal 409. |
| TC-BOOK-14 | P0 | Hold kedaluwarsa | Set `BOOKING_HOLD_MINUTES=1`, buat booking, tunggu worker expiry | Status menjadi `payment_expired`; kuota dilepas; pembayaran pending menjadi `expired`; tercatat di riwayat. |
| TC-BOOK-15 | P1 | Pembatalan melepas kuota | Batalkan booking `pending_payment`/`paid`/`confirmed` | Sesuai aturan: kuota dilepas untuk yang belum dibayar; booking berbayar menunggu proses refund; status dan riwayat benar. |
| TC-BOOK-16 | P1 | Snapshot harga | Buat booking, ubah harga paket/jadwal, buka booking lama | Invoice lama tidak berubah; booking baru memakai harga terbaru. |
| TC-BOOK-17 | P0 | Kode booking unik | Buat banyak booking | Tidak ada kode duplikat; format konsisten; kode tidak mudah ditebak. |
| TC-BOOK-18 | P0 | Akses booking orang lain | Pelanggan A membuka kode booking pelanggan B via UI dan API | Ditolak 404/403 tanpa membocorkan data; voucher juga tidak dapat diakses. |

### 7.5 Pembayaran

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-PAY-01 | P0 | Buat instruksi pembayaran | `POST /bookings/:code/payments` untuk booking `pending_payment` | Payment `pending` dibuat dengan referensi unik, nominal = total invoice, currency IDR, VA/URL pembayaran. |
| TC-PAY-02 | P1 | Reuse payment pending | Panggil endpoint pembayaran dua kali | Payment pending yang sama dikembalikan; tidak membuat tagihan ganda. |
| TC-PAY-03 | P1 | Status tidak valid | Buat pembayaran untuk booking `paid`, `cancelled`, `expired` | Ditolak 409; tidak ada payment baru. |
| TC-PAY-04 | P0 | Simulasi development | Buka `/payment/simulate?ref=...` atau `POST /dev/payments/:ref/pay` | Webhook bertanda tangan diproses; booking `pending_payment` → `paid` → `confirmed`; kuota tetap terpakai. |
| TC-PAY-05 | P0 | Simulasi di produksi | Set `SERVER_ENV=production`, panggil endpoint simulasi dan buka halaman simulate | Endpoint dan halaman ditolak/tidak tersedia; tidak ada pembayaran yang dapat dipalsukan. |
| TC-PAY-06 | P0 | Webhook valid | Kirim payload dengan signature HMAC-SHA256 benar | Event disimpan `processed=true`; nominal, currency, dan invoice cocok; booking terkonfirmasi. |
| TC-PAY-07 | P0 | Signature salah | Signature salah, kosong, payload diubah setelah ditandatangani | Ditolak 401; event tercatat gagal; booking tidak berubah. |
| TC-PAY-08 | P0 | Event duplikat | Kirim `event_id` yang sama dua kali | Proses idempoten; hanya satu efek; respons sukses; tidak ada pembayaran/kuota ganda. |
| TC-PAY-09 | P0 | Nominal tidak cocok | Kirim nominal lebih kecil/lebih besar dari invoice | Ditolak; booking tidak menjadi `paid`; selisih tercatat untuk investigasi. |
| TC-PAY-10 | P0 | Currency/invoice tidak cocok | Kirim currency selain IDR atau kode booking tidak ada | Ditolak; tidak ada perubahan status. |
| TC-PAY-11 | P1 | Provider tidak dikenal | Kirim webhook ke provider acak | Ditolak 400; tidak diproses. |
| TC-PAY-12 | P1 | Bayar setelah hold habis | Coba buat pembayaran setelah `expires_at` | Ditolak 409; pelanggan diarahkan membuat booking baru. |
| TC-PAY-13 | P1 | Pembayaran manual admin | Admin mencatat pembayaran dengan nominal = total dan nominal berbeda | Nominal sama berhasil dan booking terkonfirmasi; nominal berbeda ditolak; aksi masuk audit log. |
| TC-PAY-14 | P1 | Refund | Admin memproses refund pada payment/booking yang memenuhi syarat | Payment `refunded`; status booking sesuai state machine; alasan tercatat; kuota tidak otomatis kembali untuk booking confirmed (sesuai runbook). |
| TC-PAY-15 | P1 | Audit webhook | Buka admin webhook events setelah berbagai skenario | Setiap event memiliki provider, event ID, referensi, status proses, dan alasan gagal; tidak dapat dihapus dari UI. |
| TC-PAY-16 | P0 | Return URL tidak dipercaya | Akses return URL sukses tanpa webhook | Booking tidak berubah menjadi `paid`; UI menampilkan status sebenarnya. |
| TC-PAY-17 | P1 | Retry notifikasi | Gagal kirim email/webhook sementara | Tidak menggandakan pembayaran; percobaan ulang aman; error tercatat. |

### 7.6 Akun pelanggan

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-ACC-01 | P1 | Profil | Ubah nama, telepon, negara, kontak darurat | Tersimpan; tampil setelah refresh; email tetap sesuai aturan. |
| TC-ACC-02 | P1 | Validasi profil | Telepon tidak valid, field terlalu panjang, email invalid | Ditolak dengan pesan jelas; data lama tetap utuh. |
| TC-ACC-03 | P1 | Daftar booking | Buka `/account/bookings` | Hanya booking milik pengguna; status, tanggal, total, dan kode benar; pagination berfungsi. |
| TC-ACC-04 | P1 | Detail dan voucher | Buka detail booking dan voucher | Data peserta, pembayaran, riwayat status, dan voucher tampil; total sesuai invoice; tidak ada data pengguna lain. |
| TC-ACC-05 | P1 | Pembatalan oleh pelanggan | Batalkan booking pada status yang diizinkan dan tidak diizinkan | Hanya status yang diizinkan yang dapat dibatalkan; alasan tercatat; kuota/refund sesuai aturan. |
| TC-ACC-06 | P0 | IDOR akun | Ganti kode booking di URL/API ke milik pengguna lain | 404/403; tidak ada kebocoran nama, telepon, peserta, atau data kesehatan. |
| TC-ACC-07 | P1 | Ulasan | Beri ulasan untuk booking `completed`, `confirmed`, dan `pending_payment` | Hanya `completed` yang boleh; rating 1–5; konten minimal 10 karakter; ulasan masuk moderasi. |
| TC-ACC-08 | P1 | Ulasan ganda | Kirim dua ulasan untuk booking yang sama | Ditolak; hanya satu ulasan per booking. |
| TC-ACC-09 | P2 | Keamanan akun | Ubah kata sandi, logout, login ulang | Kata sandi lama tidak berlaku; sesi lama tidak dapat mengakses data setelah token kedaluwarsa/dicabut. |

### 7.7 Admin dan RBAC

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-ADM-01 | P0 | Proteksi area admin | Akses `/admin` sebagai pelanggan, anonim, dan staf nonaktif | Ditolak; tidak ada data admin yang dirender; API mengembalikan 401/403. |
| TC-ADM-02 | P1 | Dashboard | Buka dashboard sebagai super admin dan ops | Booking hari ini, pendapatan, pembayaran menunggu, keberangkatan mendatang, okupansi, dan tugas tampil; angka konsisten dengan database. |
| TC-ADM-03 | P1 | Buat paket | Buat paket dengan field wajib, itinerary, add-on, FAQ, SEO, gambar | Paket tersimpan sebagai draft/published sesuai pilihan; validasi field; slug unik. |
| TC-ADM-04 | P1 | Edit dan publish paket | Ubah harga/konten, publish, cek situs publik | Perubahan tampil tanpa deploy frontend; paket draft tidak tampil publik. |
| TC-ADM-05 | P2 | Hapus paket | Hapus paket tanpa booking dan paket dengan relasi | Sesuai aturan; relasi aman; data booking lama tidak rusak; aksi tercatat. |
| TC-ADM-06 | P0 | CRUD jadwal | Buat/ubah/hapus jadwal: tanggal, kapasitas, harga khusus, cut-off, status, guide | Validasi kapasitas tidak kurang dari `reserved_count`; perubahan langsung memengaruhi ketersediaan publik. |
| TC-ADM-07 | P1 | Filter booking | Filter status, paket, rentang tanggal, pencarian kode/nama/email | Hasil dan total benar; kombinasi filter bekerja; pagination konsisten. |
| TC-ADM-08 | P1 | Detail booking | Buka detail booking | Riwayat status, pembayaran, peserta, catatan, dan aksi tersedia; data health hanya untuk role berwenang. |
| TC-ADM-09 | P0 | Transisi status | Uji semua transisi yang diizinkan dan dilarang sesuai `docs/RUNBOOK.md` | Hanya transisi valid yang berhasil; alasan wajib; riwayat dan audit log tercatat; kuota dilepas hanya pada transisi yang tepat. |
| TC-ADM-10 | P2 | Catatan internal | Simpan catatan internal | Tersimpan; terlihat di detail admin; tidak bocor ke pelanggan. |
| TC-ADM-11 | P2 | Kirim ulang notifikasi | Kirim ulang invoice/voucher | Email tercatat; tidak mengubah status; aksi masuk audit log. |
| TC-ADM-12 | P1 | Export CSV | Export booking dengan dan tanpa filter | File CSV terunduh; header dan isi benar; encoding aman; data kesehatan sensitif tidak ikut tanpa otorisasi. |
| TC-ADM-13 | P1 | Daftar pembayaran | Filter status, cari kode/referensi | Data benar; nominal, metode, dan status sesuai; pagination benar. |
| TC-ADM-14 | P1 | Webhook events | Buka daftar event sebagai super/ops dan sebagai konten | Hanya role berwenang dapat mengakses; event gagal terlihat beserta alasannya. |
| TC-ADM-15 | P1 | Pelanggan | Cari dan buka detail pelanggan | Riwayat booking tampil; data sensitif dibatasi sesuai role. |
| TC-ADM-16 | P1 | Kupon | CRUD kupon: tipe, nilai, min. belanja, maks. diskon, kuota, tanggal | Validasi benar; kupon aktif langsung dapat dipakai; kupon nonaktif ditolak. |
| TC-ADM-17 | P1 | Moderasi ulasan | Setujui/tolak ulasan | Hanya ulasan published tampil publik; keputusan tercatat. |
| TC-ADM-18 | P1 | Konten dan FAQ | CRUD halaman/FAQ, ubah slug, publish/draft | Perubahan tampil di publik setelah publish; HTML berbahaya disanitasi; slug duplikat ditolak. |
| TC-ADM-19 | P2 | Pesan kontak | Lihat pesan, ubah status | Pesan baru tampil; status berubah; tidak ada akses untuk pelanggan. |
| TC-ADM-20 | P0 | Manajemen staf | Super admin membuat/mengubah/menonaktifkan staf; ops mencoba akses | Hanya super admin; role valid; staf nonaktif tidak bisa login; perubahan tercatat. |
| TC-ADM-21 | P1 | Pengaturan | Ubah identitas bisnis, kontak, dan setting publik | Tersimpan; tampil di publik; hanya super admin yang dapat mengubah. |
| TC-ADM-22 | P1 | Audit log | Lakukan aksi create/update/delete/status/refund | Audit log mencatat aktor, aksi, entitas, nilai sebelum/sesudah, dan waktu; hanya super admin dapat membaca. |
| TC-ADM-23 | P0 | Matriks RBAC API | Panggil setiap endpoint admin dengan role customer, content, ops, super | Hasil sesuai matriks di bagian 7.8; tidak ada endpoint admin yang dapat diakses customer. |
| TC-ADM-24 | P1 | State UI setelah sesi berakhir | Biarkan token kedaluwarsa saat di admin | Diarahkan ke login; tidak ada request berulang tanpa henti; tidak ada data lama yang tetap terlihat. |

### 7.8 Matriks RBAC yang harus diuji

| Modul/aksi | Customer | Admin Content | Admin Ops | Super Admin |
| --- | --- | --- | --- | --- |
| Dashboard admin | ❌ | ✅ | ✅ | ✅ |
| Baca paket admin | ❌ | ✅ | ✅ | ✅ |
| Create/update/delete paket | ❌ | ✅ | ❌ | ✅ |
| Baca jadwal | ❌ | ✅ | ✅ | ✅ |
| Create/update/delete jadwal | ❌ | ❌ | ✅ | ✅ |
| Baca booking/pembayaran | ❌ | ✅ | ✅ | ✅ |
| Ubah status/catatan booking, resend | ❌ | ❌ | ✅ | ✅ |
| Pembayaran manual/refund | ❌ | ❌ | ✅ | ✅ |
| Webhook events | ❌ | ❌ | ✅ | ✅ |
| Baca pelanggan | ❌ | ✅ | ✅ | ✅ |
| CRUD kupon | ❌ | ✅ | ❌ | ✅ |
| Moderasi ulasan | ❌ | ✅ | ❌ | ✅ |
| CRUD konten/FAQ | ❌ | ✅ | ❌ | ✅ |
| Pesan kontak | ❌ | ✅ | ✅ | ✅ |
| Staf | ❌ | ❌ | ❌ | ✅ |
| Pengaturan | ❌ | ❌ | ❌ | ✅ |
| Audit log | ❌ | ❌ | ❌ | ✅ |
| Booking/akun sendiri | ✅ | ✅ | ✅ | ✅ |

Catatan: admin content/ops tetap dapat memiliki booking sebagai pelanggan; pengujian harus memastikan akses pelanggan tidak otomatis memberi akses admin.

### 7.9 Konten, kupon publik, dan kontak

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-CMS-01 | P1 | Validasi kontak | Kirim form dengan nama/email/pesan kosong, email invalid, pesan terlalu panjang | Validasi klien dan server; tidak tersimpan jika invalid. |
| TC-CMS-02 | P1 | Rate limit kontak | Kirim >5 pesan/menit dari IP sama | HTTP 429 setelah batas; pesan valid sebelumnya tetap tersimpan. |
| TC-CMS-03 | P1 | Pesan masuk admin | Kirim pesan valid | Pesan muncul di admin dengan status awal; data kontak benar. |
| TC-CMS-04 | P2 | Validasi kupon publik | `POST /coupons/:code/validate` dengan kode valid, invalid, nonaktif | Respons diskon benar atau pesan penolakan; tidak membocorkan daftar kupon. |
| TC-CMS-05 | P1 | Sanitasi konten | Simpan konten dengan `<script>`, `onerror`, iframe berbahaya | Tidak dieksekusi di publik/admin; HTML aman tetap tampil. |
| TC-CMS-06 | P2 | FAQ | Buka FAQ dan accordion | Semua FAQ published tampil; interaksi keyboard berfungsi. |
| TC-CMS-07 | P2 | Konten draft | Set halaman menjadi draft | Halaman tidak dapat diakses publik atau menampilkan 404 yang sesuai. |

### 7.10 API dan kontrak

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-API-01 | P1 | Envelope sukses | Panggil endpoint sukses | `meta.status=success`, `meta.code`, `data` sesuai; tidak ada field internal tak terdokumentasi. |
| TC-API-02 | P1 | Envelope error | Panggil endpoint dengan input invalid | `meta.status=error`, pesan ramah, code HTTP tepat, tanpa stack trace/SQL. |
| TC-API-03 | P1 | Pagination | Uji page 0, negatif, sangat besar, page_size >100 | Nilai dinormalisasi; tidak error; batas maksimum diterapkan. |
| TC-API-04 | P2 | 404 dan 405 | Akses resource/route tidak ada, metode salah | 404/405 konsisten; tidak ada panic. |
| TC-API-05 | P2 | Content-Type | Kirim body non-JSON, JSON rusak, body kosong | 400 dengan pesan validasi; server tidak crash. |
| TC-API-06 | P2 | Request ID | Kirim `X-Request-ID` dan tanpa header | Header diteruskan/dihasilkan; ID muncul di response dan log. |
| TC-API-07 | P1 | Health check | DB hidup dan DB dimatikan | `ok` saat sehat; `degraded` saat DB tidak terjangkau; endpoint tidak membocorkan kredensial. |
| TC-API-08 | P1 | Kontrak OpenAPI | Validasi request/response endpoint utama terhadap `backend/docs/openapi.yaml` | Tidak ada perbedaan field, tipe, status code, atau format tanggal/uang. |
| TC-API-09 | P2 | Format data | Periksa tanggal, waktu, IDR, dan null | Tanggal `YYYY-MM-DD` untuk tanggal; waktu ISO 8601; IDR tanpa desimal; null konsisten. |
| TC-API-10 | P2 | Payload besar | Kirim body melebihi batas wajar | Ditolak dengan 400/413; server tetap responsif. |

### 7.11 Keamanan

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-SEC-01 | P0 | Autentikasi endpoint | Panggil seluruh endpoint customer/admin tanpa token | 401; tidak ada data yang dikembalikan. |
| TC-SEC-02 | P0 | Otorisasi RBAC | Uji matriks 7.8 langsung via API | 403 untuk role tanpa hak; UI tidak menjadi satu-satunya kontrol. |
| TC-SEC-03 | P0 | IDOR | Ganti ID/kode booking, pembayaran, pelanggan, file pada request | Hanya data milik pengguna/role yang dapat diakses. |
| TC-SEC-04 | P0 | Manipulasi JWT | Ubah payload/role, signature salah, `alg=none`, token kedaluwarsa | Semua ditolak; tidak ada eskalasi role. |
| TC-SEC-05 | P1 | Rate limiting | Uji global 60/menit, auth/payment 10/menit, kontak 5/menit | 429 dengan header yang benar; limiter tidak dapat diakali dengan `X-Forwarded-For` palsu tanpa konfigurasi proxy tepercaya. |
| TC-SEC-06 | P0 | CORS | Kirim `Origin` diizinkan dan tidak diizinkan pada produksi; uji preflight | Origin tidak sah tidak mendapat `Access-Control-Allow-Origin`; preflight sesuai. |
| TC-SEC-07 | P1 | Security headers | Periksa response API dan frontend | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; HSTS aktif di produksi. |
| TC-SEC-08 | P0 | Kebocoran secret | Cari secret di repository, `frontend/dist`, bundle, source map, log | Tidak ada `JWT_SECRET`, `PAYMENT_GATEWAY_SECRET`, kredensial DB/email di klien atau git. |
| TC-SEC-09 | P1 | SQL injection | Uji payload injeksi pada search, filter, slug, kode booking, login | Query aman (parameterized); tidak ada error SQL atau bypass. |
| TC-SEC-10 | P1 | XSS | Uji stored/reflected XSS pada nama, catatan, ulasan, konten, pesan | Tidak dieksekusi; output di-escape/disanitasi; CSP dipertimbangkan. |
| TC-SEC-11 | P1 | Penyimpanan kata sandi | Periksa database dan respons API | Hanya bcrypt hash; tidak ada kata sandi plaintext di log/respons. |
| TC-SEC-12 | P0 | Data kesehatan | Akses `health_note` sebagai customer lain, admin content, dan ops | Hanya role berwenang yang dapat melihat; tidak ikut di endpoint publik/export tanpa otorisasi. |
| TC-SEC-13 | P0 | Replay webhook | Replay payload valid berkali-kali dan ubah nominal | Idempoten; nominal salah ditolak; tidak ada pembayaran ganda. |
| TC-SEC-14 | P1 | Mass assignment | Kirim `role`, `is_active`, `user_id`, `total`, `status` pada endpoint publik | Field yang tidak berhak diabaikan; tidak ada eskalasi atau perubahan harga/status. |
| TC-SEC-15 | P1 | Enumerasi akun | Bandingkan respons login/forgot password untuk email ada/tidak ada | Pesan dan timing tidak membocorkan keberadaan akun secara jelas. |
| TC-SEC-16 | P1 | Dependensi | Jalankan `govulncheck`, `npm audit`, dan pemindaian container | Tidak ada kerentanan kritis/tinggi yang belum dimitigasi sebelum rilis. |
| TC-SEC-17 | P2 | Error verbose | Picu error server/DB | Tidak ada stack trace, path server, query SQL, atau konfigurasi internal pada respons. |
| TC-SEC-18 | P1 | Staf nonaktif | Nonaktifkan staf saat token masih valid, lalu akses API | Akses admin ditolak; token tidak memberi akses permanen. |
| TC-SEC-19 | P1 | Header injection/log forging | Kirim newline pada input dan `X-Request-ID` aneh | Tidak ada log injection; nilai ditangani aman. |

### 7.12 Non-fungsional

| ID | P | Skenario | Langkah kunci | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-NFR-01 | P1 | Core Web Vitals | Lighthouse mobile pada beranda, katalog, detail, checkout | LCP < 2,5 dtk pada koneksi mobile umum; CLS dan INP dalam ambang baik. |
| TC-NFR-02 | P1 | Latensi API | Ukur p50/p95 endpoint katalog, quote, booking, dashboard | p95 katalog < 500 ms pada beban normal; endpoint tulis wajar dan tidak timeout. |
| TC-NFR-03 | P1 | Uji beban baca | k6: 100–300 virtual user pada katalog/detail | Error rate < 1%; tidak ada memory leak/penurunan tajam; rate limit berperilaku sesuai desain. |
| TC-NFR-04 | P0 | Uji beban booking | k6/paralel: rebutan kuota pada satu jadwal | Tidak ada oversell; transaksi konsisten; error 409 terkontrol; waktu respons wajar. |
| TC-NFR-05 | P1 | Aksesibilitas otomatis | axe DevTools pada halaman utama dan form | Tidak ada pelanggaran kritis; target WCAG 2.2 AA. |
| TC-NFR-06 | P1 | Keyboard & fokus | Navigasi seluruh form/modal dengan Tab/Shift+Tab/Enter/Escape | Fokus terlihat, urutan logis, modal fokus terperangkap, Escape menutup, tidak ada focus trap bocor. |
| TC-NFR-07 | P1 | Kontras, label, alt | Periksa form, tombol, error, gambar | Label terhubung, error diumumkan, kontras memadai, gambar dekoratif punya alt yang tepat. |
| TC-NFR-08 | P1 | Responsif | Uji viewport 360–1440 px pada halaman utama | Layout tidak rusak; tabel admin dapat di-scroll; CTA tetap dapat digunakan. |
| TC-NFR-09 | P1 | Cross-browser | Jalankan smoke E2E di Chrome, Edge, Firefox, Safari/WebKit | Alur utama berjalan; perbedaan rendering tidak menghalangi penggunaan. |
| TC-NFR-10 | P2 | SEO dasar | Periksa `robots.txt`, sitemap, canonical, OG, schema.org | Sitemap memuat halaman published; halaman draft/private tidak diindeks; metadata valid. |
| TC-NFR-11 | P2 | Optimasi gambar | Periksa format, ukuran, lazy loading, `srcset` | Gambar WebP/AVIF responsif; tidak memuat gambar besar yang tidak perlu. |
| TC-NFR-12 | P1 | Observability | Picu error dan webhook gagal | Log terstruktur dengan request/booking ID; error tracking menangkap; alert webhook gagal berfungsi. |
| TC-NFR-13 | P0 | Backup/restore | Lakukan backup, restore ke DB uji, verifikasi data | Backup valid; restore berhasil; health, login, booking terakhir, dan worker expiry berjalan. |
| TC-NFR-14 | P1 | DB degraded | Hentikan MySQL sementara | Health `degraded`; UI menampilkan error yang ramah; tidak ada kebocoran detail; pulih setelah DB kembali. |
| TC-NFR-15 | P2 | Zona waktu dan tanggal | Uji sekitar tengah malam WIB, cut-off, dan format tanggal | Perbandingan tanggal konsisten; tidak ada booking yang tiba-tiba dianggap lewat/hilang. |
| TC-NFR-16 | P2 | Error jaringan | Simulasikan offline dan API 500 saat checkout | Ada pesan error dan opsi coba lagi; tidak terjadi double submit; data form tidak hilang tanpa alasan. |
| TC-NFR-17 | P2 | Tema dan preferensi | Uji tema terang/gelap di semua halaman | Kontras tetap baik; tidak ada elemen yang tak terbaca. |

### 7.13 UAT operasional

| ID | P | Skenario | Aktor | Hasil yang diharapkan |
| --- | --- | --- | --- | --- |
| TC-UAT-01 | P0 | Happy path pelanggan | Pelanggan + ops | Cari paket → pilih jadwal → isi peserta → bayar → terima konfirmasi/voucher → lihat di akun. |
| TC-UAT-02 | P0 | Pembayaran kedaluwarsa | Pelanggan + ops | Booking expired, kuota kembali, pelanggan dapat memesan ulang; tidak ada kursi yang hilang. |
| TC-UAT-03 | P0 | Pembatalan dan refund | Pelanggan + ops | Kebijakan pembatalan tampil dan dipatuhi; refund tercatat; status dan komunikasi jelas. |
| TC-UAT-04 | P1 | Penutupan jadwal | Ops | Ops menutup jadwal karena cuaca/izin; jadwal tidak dapat dibooking; pelanggan terdampak diidentifikasi. |
| TC-UAT-05 | P2 | Perubahan konten | Admin konten | Ubah harga/deskripsi/FAQ lewat admin; perubahan tampil di publik tanpa deploy; versi draft tidak bocor. |
| TC-UAT-06 | P0 | Pemisahan peran | Semua role | Ops tidak dapat mengubah konten; content tidak dapat mengubah status booking; hanya super admin mengelola staf/settings/audit. |
| TC-UAT-07 | P1 | Ulasan pascaperjalanan | Pelanggan + admin konten | Pelanggan dengan booking completed dapat mengirim ulasan; ulasan tampil setelah moderasi. |
| TC-UAT-08 | P0 | Drill overbooking | Ops + engineering | Simulasi rebutan kursi; tim dapat mendeteksi, menghentikan penjualan, dan menangani sesuai runbook. |

## 8. Skenario khusus yang wajib diotomasi

### 8.1 Overbooking/konkurensi

Tujuan: membuktikan `reserved_count` tidak pernah melebihi `capacity` dan hanya sejumlah kursi yang berhasil dibooking.

Langkah:

1. Siapkan jadwal dengan `capacity = 5`, `reserved_count = 0`, status `open`.
2. Kirim 30 request `POST /api/v1/bookings` secara paralel dengan 1 peserta per request dan `Idempotency-Key` berbeda.
3. Periksa respons: tepat 5 sukses, sisanya 409.
4. Periksa database: `reserved_count = 5`; jumlah booking `pending_payment` = 5.
5. Ulangi dengan `capacity = 1` dan 20 request untuk memastikan tidak ada race condition.
6. Jalankan minimal 10 iterasi pada CI/staging; catat kegagalan flaky.

### 8.2 Idempotensi checkout

- Kirim dua request identik dengan `Idempotency-Key` sama secara bersamaan.
- Pastikan hanya satu booking dan satu reservasi kuota.
- Ulangi dengan key berbeda; pastikan dua booking terpisah (sesuai aturan).

### 8.3 Expiry worker

- Set `BOOKING_HOLD_MINUTES=1`.
- Buat booking dan payment pending.
- Tunggu minimal 2 menit (worker berjalan maksimal 1 menit menurut runbook).
- Verifikasi booking `payment_expired`, payment `expired`, kuota kembali, dan riwayat status tercatat.
- Pastikan booking yang sudah `paid` tidak ikut expired.

### 8.4 Webhook

| Kasus | Payload | Signature | Ekspektasi |
| --- | --- | --- | --- |
| Valid | Nominal dan invoice benar | Valid | `processed=true`, booking confirmed |
| Duplikat | `event_id` sama | Valid | Sukses tanpa efek ganda |
| Signature salah | Valid | Salah | 401, event gagal, booking tidak berubah |
| Nominal salah | Nominal berbeda | Valid | Ditolak, event gagal |
| Currency salah | USD | Valid | Ditolak |
| Booking tidak ada | Kode acak | Valid | Ditolak |
| Provider salah | `unknown` | Valid | 400 |

## 9. Otomasi dan struktur yang disarankan

```text
backend/
  internal/services/*_test.go          # unit + integration service
  internal/handlers/*_test.go          # handler + middleware
  internal/middleware/*_test.go
frontend/
  src/**/__tests__/                    # Vitest + React Testing Library
  tests/e2e/                           # Playwright
    public.spec.js
    auth.spec.js
    booking.spec.js
    payment.spec.js
    admin.spec.js
  playwright.config.js
```

Perintah dasar:

```bash
# Backend
cd backend
go test ./... -count=1
go test ./internal/services/... -race -count=1
go vet ./...

# Frontend
cd frontend
npm ci
npm run lint
npm run build
npx playwright test

# Keamanan dan performa (tambahan yang disarankan)
govulncheck ./...
npm audit --omit=dev
k6 run tests/load/catalog.js
```

Pipeline CI minimum yang disarankan pada setiap pull request:

1. `go vet` + `go test ./...`.
2. `npm ci` + `npm run lint` + `npm run build`.
3. Playwright smoke pada Chromium.
4. Validasi kontrak OpenAPI.
5. Pemindaian dependensi.

## 10. Jadwal dan estimasi

Estimasi untuk 1 QA dengan dukungan 1 developer; sesuaikan dengan kapasitas tim.

| Fase | Aktivitas | Output | Estimasi |
| --- | --- | --- | --- |
| 0 | Penyiapan environment, data uji, akun, dan akses | Environment siap, dataset uji | 0,5 hari |
| 1 | Smoke + regresi katalog publik | Laporan smoke | 0,5 hari |
| 2 | Autentikasi, akun, dan checkout | Test case tereksekusi, bug tercatat | 1,5 hari |
| 3 | Pembayaran, webhook, refund, expiry | Bukti uji payment + defect | 1,5 hari |
| 4 | Admin, RBAC, konten, audit | Matriks RBAC terverifikasi | 1,5 hari |
| 5 | Keamanan baseline, performa, aksesibilitas, SEO | Laporan non-fungsional | 1 hari |
| 6 | UAT operasional + perbaikan + retest | UAT sign-off | 1,5 hari |
| 7 | Regresi akhir dan go/no-go | Laporan akhir | 0,5 hari |

Total perkiraan: **8–9 hari kerja** untuk cakupan penuh, di luar waktu perbaikan bug oleh tim engineering.

## 11. Manajemen defek

### 11.1 Severity

| Severity | Definisi | Contoh |
| --- | --- | --- |
| S1 — Blocker | Tidak ada workaround; merusak data/uang/keamanan | Overbooking, pembayaran ganda, IDOR, admin bisa diakses pelanggan |
| S2 — Critical | Alur utama gagal; workaround sulit | Checkout selalu gagal, webhook valid tidak memproses pembayaran |
| S3 — Major | Fungsi penting terganggu; ada workaround | Filter salah, export CSV tidak lengkap |
| S4 — Minor | Gangguan kecil | Validasi pesan kurang jelas, layout bergeser |
| S5 — Cosmetic | Kosmetik/typo | Teks tidak konsisten |

### 11.2 Template bug

```text
Judul: [Modul] ringkasan singkat
ID: BUG-XXX
Severity/Priority: S? / P?
Environment: local | staging | build/commit
Role: anonim | customer | admin_content | admin_ops | super_admin
Prasyarat:
Langkah reproduksi:
  1.
  2.
  3.
Hasil aktual:
Hasil yang diharapkan:
Bukti: screenshot/video/log/request ID
Dampak bisnis:
Catatan tambahan:
```

Aturan:

- S1/S2 harus segera dieskalasi ke engineering lead dan product owner.
- Bug keamanan tidak boleh dibahas detail di channel publik; gunakan jalur insiden.
- Retest dilakukan pada build yang sama setelah perbaikan; regresi terkait harus dijalankan ulang.

## 12. Kriteria masuk dan keluar

### 12.1 Entry criteria

- Build backend dan frontend berhasil; migrasi berjalan; seeder selesai.
- `GET /api/v1/health` mengembalikan `ok`.
- Akun demo dan data uji tersedia.
- Kontrak API dan catatan perubahan diketahui QA.
- Environment uji tidak memakai data produksi.
- Tidak ada blocker environment yang belum diselesaikan.

### 12.2 Exit criteria

- 100% test case P0 dieksekusi dan lulus.
- ≥95% test case P1 dieksekusi; sisa yang belum dijalankan disetujui product owner.
- Tidak ada bug S1/S2 terbuka.
- Bug S3 memiliki workaround atau disetujui untuk rilis berikutnya.
- UAT dijalankan dan ditandatangani product owner/ops.
- Backup/restore, health check, dan monitoring dasar terbukti berjalan.
- Tidak ada secret produksi di repository/bundle.
- Laporan pengujian dan daftar risiko residual diserahkan.

## 13. Traceability ke kriteria penerimaan PRD

| Kriteria penerimaan PRD | Test case terkait |
| --- | --- |
| Admin dapat membuat paket dan jadwal; perubahan tampil tanpa deploy | TC-ADM-03, TC-ADM-04, TC-ADM-06, TC-UAT-05 |
| Pelanggan memilih jadwal, memasukkan peserta, mendapat kode unik | TC-PUB-09, TC-BOOK-08, TC-BOOK-17 |
| Sistem menolak booking saat kuota tidak cukup, termasuk konkurensi | TC-BOOK-11, TC-BOOK-12, TC-BOOK-13, TC-NFR-04 |
| Total invoice dihitung dan divalidasi server | TC-BOOK-01, TC-BOOK-05, TC-BOOK-06, TC-SEC-14 |
| Webhook sukses mengubah booking secara idempoten dan mengirim bukti | TC-PAY-06, TC-PAY-08, TC-PAY-15, TC-PAY-17 |
| Pelanggan hanya melihat booking sendiri; admin sesuai role | TC-BOOK-18, TC-ACC-06, TC-ADM-01, TC-ADM-23, TC-SEC-02, TC-SEC-03 |
| Admin filter booking, riwayat, export, catatan | TC-ADM-07, TC-ADM-08, TC-ADM-09, TC-ADM-10, TC-ADM-12 |
| Halaman publik responsif, keyboard-friendly, SEO dasar | TC-PUB-15, TC-PUB-16, TC-NFR-05..07, TC-NFR-10 |
| Tidak ada secret produksi; backup dan monitoring diuji | TC-SEC-08, TC-NFR-12, TC-NFR-13 |

## 14. Risiko pengujian dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Belum ada E2E/CI | Regresi tidak terdeteksi dini | Bangun smoke E2E dan pipeline sebelum fase rilis. |
| Uji waktu (hold/expiry) lambat dan flaky | Eksekusi tidak efisien | Gunakan `BOOKING_HOLD_MINUTES=1`, kontrol waktu di integration test, dan worker yang deterministik. |
| Konkurensi flaky di mesin lokal | Hasil tidak konsisten | Jalankan di MySQL container dengan isolasi memadai; ulangi 10x; catat waktu dan query. |
| Gateway mock berbeda dari gateway nyata | Bug baru saat go-live | Uji adapter sandbox gateway nyata sebelum produksi; jangan menganggap mock sebagai bukti integrasi. |
| Email hanya dicatat di development | Notifikasi produksi tidak teruji | Uji provider email di staging; verifikasi SPF/DKIM dan isi template. |
| Data seed berubah | Test case bergantung pada ID | Cari data berdasarkan slug/kode, bukan ID hardcoded; siapkan fixture khusus. |
| Pengujian memakai data pribadi | Pelanggaran privasi | Gunakan data sintetis; batasi akses; hapus data uji setelah selesai. |
| Rate limit mengganggu test paralel | False negative | Naikkan limit khusus environment uji atau jalankan dari IP terpisah; jangan menurunkan kontrol produksi. |
| Pengujian produksi destruktif | Kerusakan data nyata | Larang reset DB/uji tulis di produksi; gunakan staging. |

## 15. Deliverables

1. Dokumen rencana pengujian ini (living document).
2. Test case sheet dengan status eksekusi, bukti, dan catatan.
3. Automation suite (Go test, Vitest, Playwright) dan konfigurasi CI.
4. Defect log dengan severity, status, dan tautan bukti.
5. Laporan hasil pengujian per fase dan ringkasan coverage.
6. Laporan non-fungsional: Lighthouse, axe, k6, pemindaian keamanan.
7. Berita acara UAT dan rekomendasi go/no-go.
8. Daftar risiko residual dan item yang ditunda.

## 16. Sign-off

| Peran | Nama | Tanggal | Keputusan |
| --- | --- | --- | --- |
| QA Lead |  |  |  |
| Product Owner |  |  |  |
| Engineering Lead |  |  |  |
| Operations Owner |  |  |  |

---

## Lampiran A — Contoh uji API cepat

Jalankan setelah backend aktif di `http://localhost:8000`.

```bash
# Health
curl -s http://localhost:8000/api/v1/health

# Katalog
curl -s "http://localhost:8000/api/v1/packages?category=trekking&sort=price_asc&page=1&page_size=5"

# Detail paket
curl -s http://localhost:8000/api/v1/packages/rinjani-summit-trekking-4d3n-sembalun

# Login pelanggan
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"Customer123!"}'

# Simpan token dari respons, lalu:
export TOKEN="<token>"

# Quote (ganti departure_id dengan ID jadwal dari detail paket)
curl -s -X POST http://localhost:8000/api/v1/bookings/quote \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"departure_id":1,"travelers_count":2,"coupon_code":"RINJANI10"}'

# Buat booking (idempotency key unik)
curl -s -X POST http://localhost:8000/api/v1/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: qa-booking-001" \
  -H "Content-Type: application/json" \
  -d '{
    "departure_id": 1,
    "travelers": [
      {"name": "QA Satu", "nationality": "Indonesia", "is_organizer": true},
      {"name": "QA Dua", "nationality": "Indonesia"}
    ],
    "organizer_name": "QA Satu",
    "organizer_phone": "6281234567890",
    "organizer_email": "qa@example.com",
    "consent": true
  }'

# Buat instruksi pembayaran
curl -s -X POST http://localhost:8000/api/v1/bookings/<KODE_BOOKING>/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"va"}'

# Simulasi pembayaran (development saja)
curl -s -X POST http://localhost:8000/api/v1/dev/payments/<REFERENSI>/pay
```

Catatan:

- Ganti `<KODE_BOOKING>`, `<REFERENSI>`, dan `departure_id` dengan data nyata dari environment uji.
- Endpoint simulasi harus mengembalikan 404/403 saat `SERVER_ENV=production`.
- Untuk webhook manual, signature adalah HMAC-SHA256 dari body mentah menggunakan `PAYMENT_GATEWAY_SECRET`, dikirim pada header `X-Signature`.

## Lampiran B — Checklist eksekusi

- [ ] Environment dan data uji siap; health check `ok`.
- [ ] Smoke test lulus (TC-SMK-01..05).
- [ ] Katalog publik dan SEO diperiksa.
- [ ] Autentikasi dan reset kata sandi diuji.
- [ ] Checkout, harga server, kupon, dan add-on diuji.
- [ ] Konkurensi kuota diuji minimal 10 iterasi.
- [ ] Hold expiry dan pelepasan kuota diverifikasi.
- [ ] Pembayaran sukses, gagal, duplikat, dan palsu diuji.
- [ ] Refund dan pembayaran manual admin diuji.
- [ ] IDOR dan matriks RBAC diuji via API.
- [ ] Admin CRUD, histori, export, audit log diuji.
- [ ] Ulasan, konten, FAQ, pesan, dan kupon diuji.
- [ ] Rate limit, CORS, header keamanan, dan secret diperiksa.
- [ ] Aksesibilitas, responsif, dan cross-browser diuji.
- [ ] Lighthouse, k6, axe, dan pemindaian dependensi dijalankan.
- [ ] Backup/restore dan health `degraded` diuji di staging.
- [ ] UAT ditandatangani; bug S1/S2 nol.
- [ ] Laporan akhir dan rekomendasi go/no-go diserahkan.
