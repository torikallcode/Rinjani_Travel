# Rencana Finishing Website Rinjani Travel

**Status:** Draft siap eksekusi  
**Versi:** 1.0  
**Tanggal:** 28 Oktober 2026  
**Baseline:** PRD MVP, hasil eksekusi QA 28 Oktober 2026, dan kondisi repository saat ini  
**Target:** Website siap dipakai pelanggan, aman, dapat dioperasikan, dan siap go-live

Dokumen terkait:

- [`PRD.md`](../PRD.md) — ruang lingkup MVP dan kriteria penerimaan
- [`README.md`](../README.md) — setup, akun demo, deployment
- [`docs/TESTING_PLAN.md`](TESTING_PLAN.md) — rencana dan matriks pengujian
- [`docs/RUNBOOK.md`](RUNBOOK.md) — prosedur operasional booking, pembayaran, refund
- [`backend/docs/openapi.yaml`](../backend/docs/openapi.yaml) — kontrak API

---

## 1. Tujuan

Dokumen ini menjabarkan pekerjaan yang diperlukan untuk mengubah kondisi saat ini — **fitur inti sudah berjalan tetapi belum siap produksi** — menjadi website yang:

1. aman untuk data pelanggan;
2. dapat memproses booking dan pembayaran secara benar;
3. dapat dioperasikan oleh tim admin;
4. memiliki kualitas UI, konten, dan performa yang layak;
5. siap dideploy, dipantau, dan dipulihkan jika terjadi masalah.

Fokus finishing adalah **menutup gap, bukan menambah fitur baru**. Fitur di luar MVP tetap ditunda.

### 1.1 Di luar lingkup finishing

Sesuai PRD, hal berikut tidak dikerjakan pada fase ini:

- marketplace multi-operator dan payout otomatis;
- aplikasi mobile native;
- dynamic pricing/AI recommendation;
- integrasi tiket Taman Nasional;
- multi-currency penuh dan multi-bahasa lengkap;
- loyalty point, affiliate, dan live chat 24/7.

---

## 2. Definisi “selesai”

Website dianggap selesai dan layak go-live jika seluruh kondisi berikut terpenuhi:

- [ ] Tidak ada temuan **S1/S2** yang terbuka.
- [ ] Seluruh item **P0** selesai dan diverifikasi di staging.
- [ ] Item **P1** selesai, atau ada keputusan tertulis untuk menundanya.
- [ ] Alur utama lulus E2E: katalog → checkout → pembayaran → voucher → pembatalan/refund.
- [ ] Pembayaran nyata dan email transaksional teruji di sandbox.
- [ ] Tidak ada endpoint simulasi pembayaran yang aktif di produksi.
- [ ] Backup database pernah direstorasi ke staging dan hasilnya diverifikasi.
- [ ] Monitoring, alert, dan runbook operasional aktif.
- [ ] Konten paket, harga, itinerary, kebijakan, dan halaman legal disetujui owner bisnis.
- [ ] UAT operasional ditandatangani product owner/operasional.
- [ ] Performa dan aksesibilitas memenuhi target di bawah.
- [ ] Rollback plan sudah diuji.

Target kualitas minimum:

| Aspek | Target |
| --- | --- |
| Core Web Vitals mobile | LCP < 2,5 detik, CLS < 0,1, INP < 200 ms |
| Lighthouse | Performance, Accessibility, Best Practices, SEO ≥ 90 |
| Aksesibilitas | WCAG 2.2 AA; tidak ada pelanggaran kritis pada axe |
| Error rate API | < 1% request 5xx pada kondisi normal |
| Payment success rate | Dipantau; kegagalan gateway memiliki alert |
| Uptime | ≥ 99,5% pada bulan pertama |
| Backup | RPO ≤ 24 jam, RTO ≤ 4 jam |

---

## 3. Baseline kondisi saat ini

### 3.1 Yang sudah tersedia

- Katalog publik: beranda, daftar paket, detail paket, galeri, tentang, FAQ, kontak, halaman konten.
- Autentikasi pelanggan: register, login, verifikasi email, lupa/reset kata sandi, profil, keamanan akun.
- Booking: pilih jadwal, peserta, add-on, kupon, perhitungan harga di server, hold kuota, idempotency.
- Pembayaran: payment mock, VA/QRIS simulasi, webhook bertanda tangan, idempotency event, refund manual.
- Admin: dashboard, paket, jadwal, booking, pembayaran, pelanggan, kupon, ulasan, konten, pesan, staf, pengaturan, audit log.
- RBAC backend untuk `super_admin`, `admin_ops`, `admin_content`, dan `customer`.
- Docker Compose untuk database, backend, dan frontend.
- Dokumen API OpenAPI, runbook operasional, dan testing plan.

### 3.2 Hasil validasi terakhir

Eksekusi QA parsial pada 28 Oktober 2026:

| Area | Hasil | Catatan |
| --- | --- | --- |
| `go test ./...`, `go vet ./...`, `go build ./...` | Lulus | Cakupan otomatis backend masih terbatas pada `rules_test.go` |
| `npm run lint`, `npm run build` | Lulus | Tidak ada error lint/build |
| Katalog publik + autentikasi + akun | 53/53 lulus | Termasuk filter, pagination, register, verifikasi, reset, profil |
| Admin + RBAC | 112/113 lulus | Satu kegagalan adalah ekspektasi harness, bukan defect aplikasi; setelah koreksi tidak ada defect |
| Booking + pembayaran | 50/54 lulus | 3 temuan aplikasi, 1 ekspektasi runbook tidak terpenuhi |
| Konkurensi kuota | Lulus | 10 request bersamaan pada kuota 3: 3 sukses, 7 konflik, tidak ada oversell |
| Hold expiry | Lulus | Booking dan payment menjadi expired, kuota kembali |
| Webhook idempotency | Lulus | Event duplikat tidak memproses ulang pembayaran |
| Refund | Lulus | Payment dan booking menjadi `refunded` |
| IDOR booking/voucher | Lulus | Pengguna lain mendapat 404 |

### 3.3 Temuan yang harus ditutup

| ID | Severity/Prioritas | Temuan | Bukti | Dampak | Prioritas |
| --- | --- | --- | --- | --- | --- |
| FIND-01 | S1 | Reset token kata sandi dikembalikan di response API produksi | `POST /auth/forgot-password` pada instance `SERVER_ENV=production` mengembalikan `reset_token` | Siapa pun yang mengetahui email korban dapat mereset kata sandi dan mengambil alih akun | P0 |
| FIND-02 | S2 | Endpoint admin webhook mengembalikan string dalam base64 | `GET /admin/webhook-events` mengembalikan `event_id`, `booking_code`, `provider`, dan `payload` dalam base64 | Tab “Webhook Events” di admin menampilkan data tidak terbaca; audit dan rekonsiliasi terganggu | P1 |
| FIND-03 | S3 | Aturan pembatalan pelanggan tidak sesuai runbook | Runbook menyebut `pending_payment`, `paid`, dan `confirmed`; implementasi hanya mengizinkan `pending_payment`/`draft` | Pelanggan tidak bisa membatalkan booking yang sudah dibayar; potensi keluhan dan ketidakpastian operasional | P1 |
| FIND-04 | S2 | JWT disimpan di `localStorage` tanpa rotasi/refresh token | `frontend/src/services/api.js` menyimpan token di `localStorage` | Risiko pencurian token jika terjadi XSS; belum memenuhi pilihan “token dengan rotasi aman” di PRD | P1 |
| FIND-05 | P1 | Belum ada automated test frontend/E2E dan CI | Tidak ada folder test frontend, Playwright, atau workflow CI | Regresi mudah lolos; kualitas bergantung pada pengujian manual | P1 |
| FIND-06 | P2 | Artefak QA dan data demo bercampur dengan data pengembangan | `backend-qa*.log` di root repo; data QA dan akun demo ada di database lokal | Risiko terbawa ke staging/produksi; repo terlihat tidak bersih | P2 |

### 3.4 Area yang belum diuji menyeluruh

Belum dieksekusi atau belum cukup bukti:

- E2E browser untuk seluruh alur checkout dan admin.
- Pengujian lintas browser dan viewport mobile nyata.
- Audit aksesibilitas dengan axe/WAVE dan uji keyboard.
- Pengukuran performa Lighthouse/WebPageTest.
- Load test dan soak test.
- Backup/restore database.
- Pengiriman email nyata, deliverability, SPF/DKIM/DMARC.
- Payment gateway sandbox/produksi nyata.
- CORS, CSP, HSTS, XFF/trusted proxy, dan rate limit di belakang reverse proxy.
- Deployment staging/produksi dan rollback.
- UAT bersama tim operasional.

Area-area ini menjadi bagian dari rencana di bawah, bukan dianggap sudah selesai.

---

## 4. Keputusan yang harus diambil sebelum eksekusi

| Keputusan | Pilihan | Rekomendasi | Batas waktu |
| --- | --- | --- | --- |
| Target rilis | Demo/staging atau produksi komersial | Produksi komersial jika akan menerima pembayaran nyata | Hari 1 |
| Payment gateway | Mock, Midtrans, Xendit, DOKU, atau vendor lain | Pilih satu vendor yang mendukung VA, QRIS, e-wallet, kartu, refund, dan webhook | Hari 1–3 |
| Email transaksional | SMTP biasa atau provider (Mailgun, Postmark, SES, Resend) | Gunakan provider dengan log pengiriman dan retry | Hari 1–3 |
| Kebijakan pembatalan | Hanya pending, atau pending + request cancellation untuk paid/confirmed | Untuk MVP: pelanggan hanya bisa cancel pending; paid/confirmed memakai “ajukan pembatalan” yang diproses ops | Hari 2 |
| Penyimpanan sesi | Tetap JWT di localStorage, atau pindah ke httpOnly cookie + refresh token | Pindah ke httpOnly cookie jika waktu memungkinkan; jika tidak, minimal CSP ketat, expiry pendek, dan rotasi token | Hari 3 |
| Hosting dan domain | VPS, PaaS, atau cloud | Staging dan produksi terpisah; HTTPS wajib; database tidak terbuka publik | Hari 2 |
| Data produksi | Seed demo atau data operator nyata | Produksi tidak boleh memakai akun demo dan data QA | Hari 5 |

Jika target hanya demo/portofolio, item **FIN-PAY-01** dan **FIN-EMAIL-01** boleh ditandai “demo only”, tetapi website tidak boleh dipromosikan sebagai layanan pembayaran nyata dan tidak boleh memuat data pribadi nyata.

### 4.1 Peran dan tanggung jawab

| Peran | Tanggung jawab utama |
| --- | --- |
| Product owner | Menentukan target rilis, kebijakan pembatalan/refund, prioritas, dan sign-off UAT |
| Tech lead/backend | Keamanan, payment gateway, email, database, deployment, observability |
| Frontend | UI/UX, aksesibilitas, performa, integrasi API, perbaikan state/error |
| Operasional | Verifikasi paket/jadwal, UAT booking, refund, konten, runbook |
| QA | Regression, E2E, security smoke test, load test, laporan bug |
| Konten/legal | Halaman legal, foto, copywriting, kebijakan privasi |

Jika tim kecil, satu orang dapat merangkap peran, tetapi **sign-off UAT tetap harus dilakukan oleh orang selain developer yang menulis fitur**.

---

## 5. Roadmap eksekusi

Estimasi untuk **1–2 developer** dengan satu orang yang juga bisa menguji. Jika hanya satu orang, gunakan estimasi batas atas dan tambahkan buffer 20%.

| Fase | Durasi | Fokus | Exit criteria |
| --- | --- | --- | --- |
| 0. Stabilisasi | 1–2 hari | Freeze scope, rapikan working tree, staging, baseline ulang | Branch bersih, staging bisa diakses, baseline test lulus |
| 1. P0 security & launch blockers | 4–6 hari | Reset token, secret/env, payment nyata, email, backup/monitoring | Tidak ada S1; pembayaran dan email sandbox lulus |
| 2. P1 product & quality | 5–7 hari | Webhook admin, pembatalan, auth hardening, E2E/CI, a11y, performa, SEO, konten | Semua P1 selesai atau diputuskan ditunda |
| 3. UAT & hardening | 2–3 hari | UAT operasional, load test, backup restore, regresi penuh | UAT sign-off, tidak ada bug blocker |
| 4. Go-live & hypercare | 1–2 hari + 7 hari | Deploy produksi, monitoring, stabilisasi | Launch sukses, alert dan runbook aktif |

Total realistis: **3–4 minggu** untuk produksi komersial; **1,5–2 minggu** jika target hanya demo/staging dengan mock payment.

---

## 6. Backlog finishing

Legenda status:

- `[ ]` belum dikerjakan
- `[~]` sedang dikerjakan
- `[x]` selesai dan terverifikasi

### 6.1 P0 — blocker go-live

#### FIN-SEC-01 — Hilangkan kebocoran reset token

- [ ] Hapus `reset_token` dari response `POST /auth/forgot-password` di semua environment.
- [ ] Response untuk email terdaftar dan tidak terdaftar harus sama.
- [ ] Token hanya boleh dikirim melalui email; untuk development boleh ditulis ke log server dengan flag eksplisit, bukan response API.
- [ ] Pastikan token tidak dapat dipakai ulang dan kedaluwarsa.
- [ ] Tambahkan regression test: response produksi tidak boleh mengandung `reset_token`.

**File terkait:** `backend/internal/handlers/auth_handler.go`, `backend/internal/services/auth_service.go`  
**Acceptance:** instance `SERVER_ENV=production` tidak pernah mengembalikan token; test otomatis menangkap jika bocor lagi.  
**Estimasi:** 0,5 hari.

#### FIN-SEC-02 — Validasi konfigurasi dan secret produksi

- [ ] Tolak startup produksi jika `JWT_SECRET`, `PAYMENT_GATEWAY_SECRET`, `DB_PASSWORD`, atau `ALLOWED_ORIGINS` masih memakai nilai default/contoh.
- [ ] Pisahkan secret staging dan produksi; gunakan secret manager atau environment terenkripsi.
- [ ] Pastikan `.env` tidak pernah masuk repository.
- [ ] Batasi user database produksi ke hak minimum.
- [ ] Pastikan `SERVER_ENV=production` menonaktifkan seluruh route `/dev/*` dan simulasi pembayaran.
- [ ] Uji CORS, HSTS, dan security header dari domain produksi.

**File terkait:** `backend/internal/config/settings.go`, `backend/internal/routes/routes.go`, `backend/internal/middleware/security.go`, `docker-compose.yml`  
**Acceptance:** startup gagal cepat jika konfigurasi tidak aman; endpoint simulasi mengembalikan 403/404 di produksi.  
**Estimasi:** 1 hari.

#### FIN-PAY-01 — Integrasi payment gateway nyata

- [ ] Pilih vendor dan dapatkan akses sandbox.
- [ ] Buat adapter provider dengan antarmuka yang sama seperti mock saat ini.
- [ ] Implementasikan pembuatan transaksi VA, QRIS, e-wallet, dan kartu sesuai dukungan vendor.
- [ ] Verifikasi signature webhook sesuai spesifikasi vendor.
- [ ] Cocokkan `amount`, `currency`, `booking_code`, dan `provider_reference` sebelum mengubah status.
- [ ] Pastikan webhook idempoten dan aman terhadap replay.
- [ ] Implementasikan rekonsiliasi pembayaran dan refund.
- [ ] Uji skenario sukses, gagal, expired, refund, dan webhook duplikat di sandbox.
- [ ] Hapus/disable mock provider di produksi.

**Acceptance:** pembayaran sandbox mengubah booking menjadi `paid`/`confirmed`; refund berhasil; tidak ada perubahan status dari return URL browser; laporan rekonsiliasi cocok.  
**Estimasi:** 3–5 hari setelah akses vendor tersedia.

#### FIN-EMAIL-01 — Email transaksional produksi

- [ ] Konfigurasikan provider email dan domain pengirim.
- [ ] Set SPF, DKIM, dan DMARC.
- [ ] Kirim email untuk register/verifikasi, reset password, booking dibuat, pembayaran diterima, pembatalan, dan selesai.
- [ ] Tambahkan retry/queue sederhana dan pencatatan status kirim.
- [ ] Jangan menulis isi email lengkap atau data sensitif ke log produksi.
- [ ] Uji deliverability ke Gmail, Outlook, dan Yahoo.

**File terkait:** `backend/internal/services/email_service.go`  
**Acceptance:** semua email transaksional diterima di sandbox dan produksi; log tidak memuat token/PII; kegagalan kirim memunculkan alert.  
**Estimasi:** 1–2 hari.

#### FIN-OPS-01 — Backup, restore, dan monitoring

- [ ] Backup database harian dengan retensi minimal 7–14 hari.
- [ ] Simpan backup di lokasi terpisah dari server aplikasi.
- [ ] Uji restore ke staging dan verifikasi data booking/pembayaran.
- [ ] Aktifkan error tracking (Sentry atau sejenis).
- [ ] Buat alert untuk 5xx, webhook gagal, pembayaran tertunda, dan database down.
- [ ] Buat dashboard uptime dan status pembayaran.
- [ ] Dokumentasikan RTO/RPO dan prosedur eskalasi.

**Acceptance:** restore berhasil dalam ≤ 4 jam; simulasi kegagalan memicu alert; runbook diperbarui.  
**Estimasi:** 1–2 hari.

#### FIN-REL-01 — Staging dan produksi

- [ ] Siapkan staging terpisah dengan database dan secret sendiri.
- [ ] Siapkan reverse proxy, HTTPS, domain, dan health check.
- [ ] Pastikan frontend memakai API URL yang benar dan tidak ada CORS error.
- [ ] Buat pipeline deploy yang dapat diulang dan memiliki rollback.
- [ ] Uji deploy dari commit bersih, bukan dari working tree lokal.
- [ ] Dokumentasikan langkah deploy, migrasi, dan rollback.

**Acceptance:** deploy staging berhasil dari CI; produksi dapat di-rollback ke versi sebelumnya; health check dan halaman utama dapat diakses.  
**Estimasi:** 1–2 hari.

#### FIN-QA-01 — Regresi penuh dan UAT

- [ ] Jalankan ulang seluruh test case prioritas P0/P1 dari `docs/TESTING_PLAN.md`.
- [ ] Uji alur nyata dengan akun non-demo.
- [ ] UAT bersama operasional: buat paket, jadwal, booking, pembayaran, refund, pembatalan.
- [ ] Uji minimal di Chrome, Safari, Firefox, dan viewport mobile 390 px.
- [ ] Catat semua bug; blocker harus nol sebelum launch.

**Acceptance:** UAT sign-off; tidak ada bug S1/S2; seluruh skenario kritis lulus.  
**Estimasi:** 2–3 hari.

### 6.2 P1 — production readiness dan kualitas

#### FIN-BUG-01 — Perbaiki response webhook events

- [ ] Ganti query `[]map[string]interface{}` dengan struct/DTO bertipe.
- [ ] Pastikan `event_id`, `provider`, `booking_code`, `error_message`, dan `payload` tampil sebagai string/JSON yang terbaca.
- [ ] Jangan tampilkan payload mentah yang terlalu besar; gunakan preview atau tombol “lihat detail”.
- [ ] Sesuaikan `AdminPaymentsPage.jsx` dan tambahkan test API.

**File terkait:** `backend/internal/handlers/payment_handler.go`, `frontend/src/pages/admin/AdminPaymentsPage.jsx`  
**Acceptance:** tab Webhook Events menampilkan ID, booking, provider, signature, dan status tanpa base64.  
**Estimasi:** 0,5–1 hari.

#### FIN-BUG-02 — Selaraskan kebijakan pembatalan

- [ ] Putuskan perilaku final: cancel langsung hanya untuk `pending_payment`, atau tambah “request cancellation” untuk `paid`/`confirmed`.
- [ ] Jika memilih request cancellation: buat status/task operasional, alasan wajib, dan audit log.
- [ ] Jika memilih cancel langsung: tentukan refund otomatis/manual dan pelepasan kuota.
- [ ] Perbarui `docs/RUNBOOK.md`, teks UI, dan email.
- [ ] Tambahkan test untuk setiap status.

**Acceptance:** kode, UI, runbook, dan email menyatakan aturan yang sama; tidak ada kebingungan saat pelanggan menghubungi support.  
**Estimasi:** 1–2 hari.

#### FIN-SEC-03 — Hardening sesi dan frontend

- [ ] Evaluasi migrasi JWT dari `localStorage` ke httpOnly cookie + refresh token.
- [ ] Jika tetap memakai Bearer token: perpendek expiry, tambahkan rotasi, dan terapkan CSP ketat.
- [ ] Tambahkan penanganan logout di semua tab.
- [ ] Pastikan tidak ada token di URL, log, atau pesan error.
- [ ] Audit dependency dengan `npm audit` dan `govulncheck`.

**File terkait:** `frontend/src/services/api.js`, `frontend/src/context/AuthContext.jsx`  
**Acceptance:** tidak ada token di `localStorage` (jika migrasi) atau risiko XSS dimitigasi dengan CSP dan expiry pendek; audit dependency tidak menemukan kerentanan kritis.  
**Estimasi:** 1–3 hari tergantung keputusan.

#### FIN-SEC-04 — Security regression test

- [ ] Uji IDOR pada booking, voucher, payment, dan customer.
- [ ] Uji RBAC untuk seluruh role pada endpoint admin.
- [ ] Uji rate limit dan perilaku `X-Forwarded-For` di belakang reverse proxy.
- [ ] Uji CORS dari origin yang diizinkan dan tidak diizinkan.
- [ ] Uji security header dan CSP.
- [ ] Uji input berbahaya: SQL injection, XSS pada konten/ulasan, dan payload JSON rusak.
- [ ] Pastikan error produksi tidak menampilkan stack trace atau detail internal.
- [ ] Simpan hasil sebagai laporan keamanan singkat.

**Acceptance:** tidak ada akses lintas pengguna/role; tidak ada bypass rate limit; tidak ada XSS/SQLi pada area yang diuji.  
**Estimasi:** 1 hari.

#### FIN-QA-02 — Otomasi dan CI

- [ ] Tambahkan Playwright untuk alur publik, auth, checkout, pembayaran mock, admin, dan RBAC.
- [ ] Tambahkan Vitest/React Testing Library untuk komponen kritis: harga, format uang, guard route, form.
- [ ] Tambahkan Go integration test dengan database test dan transaksi.
- [ ] Buat workflow CI: lint, build, `go test`, `go vet`, Playwright, secret scan.
- [ ] Jalankan test pada pull request dan sebelum deploy.
- [ ] Simpan artifact test (screenshot/video) saat gagal.

**Acceptance:** CI gagal jika ada regresi; minimal 10 skenario E2E kritis berjalan otomatis.  
**Estimasi:** 2–3 hari.

#### FIN-UX-01 — Aksesibilitas WCAG 2.2 AA

- [ ] Audit keyboard navigation, focus visible, focus trap modal, dan skip link.
- [ ] Pastikan semua input memiliki label, error terhubung ke field, dan status tidak hanya dibedakan warna.
- [ ] Periksa kontras teks, termasuk dark mode.
- [ ] Tambahkan alt text bermakna dan `aria-label` pada ikon interaktif.
- [ ] Hormati `prefers-reduced-motion`.
- [ ] Uji dengan axe dan screen reader dasar.

**Acceptance:** tidak ada pelanggaran kritis axe; alur booking dapat diselesaikan dengan keyboard.  
**Estimasi:** 2 hari.

#### FIN-UX-02 — Performa dan optimasi aset

- [ ] Kompres gambar ke WebP/AVIF, hapus file `.bak.jpg` dan aset tidak terpakai.
- [ ] Tambahkan `srcset`, `loading="lazy"`, dan dimensi eksplisit.
- [ ] Code-split halaman admin dan komponen berat.
- [ ] Preload hero image dan font utama.
- [ ] Aktifkan kompresi dan cache header di nginx.
- [ ] Ukur Lighthouse mobile dan perbaiki bottleneck.

**Acceptance:** LCP mobile < 2,5 detik pada koneksi 4G; Lighthouse Performance ≥ 90.  
**Estimasi:** 2 hari.

#### FIN-SEO-01 — Audit SEO dan metadata

- [ ] Pastikan setiap halaman memakai `Seo.jsx` dengan title/description unik.
- [ ] Tambahkan Open Graph image default dan per paket.
- [ ] Validasi JSON-LD `TouristTrip`/`Product`/`FAQPage`.
- [ ] Buat sitemap dinamis dari paket published.
- [ ] Pastikan `robots.txt` memblokir admin, akun, checkout, dan pembayaran.
- [ ] Periksa canonical URL dan redirect www/non-www.

**Acceptance:** tidak ada duplicate title/description pada halaman utama; sitemap memuat paket published; rich result valid.  
**Estimasi:** 1–2 hari.

#### FIN-CONTENT-01 — Finalisasi konten dan aset

- [ ] Ganti foto stok/placeholder dengan foto operator yang haknya jelas.
- [ ] Verifikasi nama paket, harga, itinerary, fasilitas, titik jemput, dan durasi.
- [ ] Review bahasa Indonesia: konsistensi istilah, harga, dan format tanggal.
- [ ] Selesaikan halaman legal: syarat, privasi, pembatalan, keselamatan.
- [ ] Pastikan kebijakan privasi mencakup data kesehatan/peserta.
- [ ] Hapus akun demo dan data QA dari database produksi.

**Acceptance:** owner bisnis menyetujui konten; tidak ada aset tanpa hak pakai; halaman legal lengkap.  
**Estimasi:** 2–3 hari (paralel dengan tim konten).

#### FIN-ADMIN-01 — Polish admin

- [ ] Perbaiki tampilan webhook events (lihat FIN-BUG-01).
- [ ] Tambahkan state loading, empty, dan error yang konsisten.
- [ ] Tambahkan konfirmasi untuk aksi destruktif dan alasan wajib untuk refund/cancel.
- [ ] Pastikan filter, pagination, dan export CSV bekerja pada data besar.
- [ ] Tampilkan status pembayaran dan riwayat status booking dengan jelas.
- [ ] Pastikan admin content tidak melihat aksi ops yang tidak berhak.

**Acceptance:** admin ops dapat menyelesaikan satu booking penuh tanpa membuka database.  
**Estimasi:** 2 hari.

#### FIN-OBS-01 — Observability dan audit

- [ ] Log terstruktur dengan `request_id`, `booking_code`, dan `payment_reference`.
- [ ] Jangan log password, token, payload kartu, atau data kesehatan.
- [ ] Pastikan audit log mencatat perubahan status, refund, dan perubahan harga.
- [ ] Hubungkan error tracking dengan release/version.
- [ ] Buat runbook alert dan eskalasi.

**Acceptance:** satu request dapat dilacak dari frontend ke backend lewat `request_id`; alert sampai ke on-call.  
**Estimasi:** 1–2 hari.

### 6.3 P2 — setelah launch

- [ ] Notifikasi WhatsApp resmi dengan template yang disetujui.
- [ ] Analytics funnel: lihat paket → checkout → payment.
- [ ] Blog/conten SEO.
- [ ] Multi-bahasa.
- [ ] Promo kompleks dan loyalty.
- [ ] Live chat/chatbot.

---

## 7. Catatan implementasi untuk temuan kritis

### 7.1 Reset token

Perbaikan minimal:

1. Di handler `ForgotPassword`, jangan sertakan `reset_token` pada response.
2. Di development, cetak token ke log server hanya jika `SERVER_ENV != production` dan flag `EXPOSE_RESET_TOKEN=true`.
3. Pastikan response email tidak terdaftar dan terdaftar identik.
4. Tambahkan test yang menjalankan handler dengan `SERVER_ENV=production` dan memastikan field `reset_token` tidak ada.

Pertimbangkan juga invalidasi sesi lama setelah reset password. Jika tetap memakai JWT stateless, tambahkan `password_changed_at` atau token version agar token lama tidak berlaku.

### 7.2 Webhook events base64

Penyebab: query GORM ke `[]map[string]interface{}` pada MySQL mengembalikan kolom string sebagai `[]byte`, lalu serializer JSON mengubahnya menjadi base64.

Perbaikan:

- Gunakan `[]models.PaymentEvent` atau DTO dengan field `string`.
- Jika payload perlu ditampilkan, gunakan `json.RawMessage` atau string yang sudah di-decode.
- Tambahkan test: `event_id` harus sama persis dengan yang dikirim, bukan base64.

### 7.3 Pembatalan pelanggan

Rekomendasi untuk MVP:

- Pelanggan hanya dapat membatalkan `pending_payment`.
- Untuk `paid`/`confirmed`, tampilkan tombol **“Ajukan pembatalan”** yang membuat catatan operasional dan mengirim email ke ops.
- Ops memutuskan refund sesuai kebijakan dan mencatat alasannya.
- Kuota hanya dikembalikan setelah ops membatalkan booking, bukan saat pengajuan.

Alternatif: jika bisnis ingin cancel langsung, implementasikan refund otomatis hanya jika kebijakan mengizinkan, dan pastikan kuota kembali secara atomik.

---

## 8. Urutan eksekusi yang disarankan

### Hari 1–2 — Stabilisasi

- [ ] Freeze fitur baru.
- [ ] Review dan commit perubahan frontend yang saat ini masih `modified`.
- [ ] Hapus `backend-qa*.log` dan artefak pengujian dari root repo.
- [ ] Siapkan database staging terpisah.
- [ ] Jalankan baseline: `go test`, `go vet`, `npm run lint`, `npm run build`.
- [ ] Buat daftar bug final dari QA.

### Hari 3–7 — P0 security dan pembayaran

- [ ] FIN-SEC-01 reset token.
- [ ] FIN-SEC-02 validasi env/secret.
- [ ] FIN-PAY-01 adapter gateway sandbox.
- [ ] FIN-EMAIL-01 email transaksional.
- [ ] Uji end-to-end pembayaran sandbox.

### Hari 8–14 — P1 product dan kualitas

- [ ] FIN-BUG-01 webhook events.
- [ ] FIN-BUG-02 kebijakan pembatalan.
- [ ] FIN-SEC-03 hardening sesi.
- [ ] FIN-QA-02 otomasi/CI.
- [ ] FIN-UX-01 aksesibilitas.
- [ ] FIN-UX-02 performa.
- [ ] FIN-SEO-01 SEO.
- [ ] FIN-CONTENT-01 konten/aset.
- [ ] FIN-ADMIN-01 polish admin.

### Hari 15–18 — UAT dan hardening

- [ ] FIN-OPS-01 backup/restore dan monitoring.
- [ ] FIN-QA-01 regresi penuh.
- [ ] Load test ringan dan uji konkurensi.
- [ ] UAT operasional.
- [ ] Perbaiki bug UAT.
- [ ] Freeze kode.

### Hari 19–20 — Go-live

- [ ] Deploy produksi.
- [ ] Smoke test.
- [ ] Aktifkan monitoring dan alert.
- [ ] Umumkan ke tim internal.
- [ ] Hypercare 7 hari.

---

## 9. UAT minimum yang wajib lulus

| ID | Skenario | Expected |
| --- | --- | --- |
| UAT-01 | Admin membuat paket published dan jadwal | Paket dan jadwal langsung tampil di publik tanpa deploy |
| UAT-02 | Pelanggan memilih jadwal, 2 peserta, add-on, kupon | Total dihitung server dan benar |
| UAT-03 | Dua pelanggan checkout pada kuota terakhir bersamaan | Hanya satu berhasil; tidak ada oversell |
| UAT-04 | Pembayaran sandbox sukses | Booking `confirmed`, voucher dapat diunduh, email terkirim |
| UAT-05 | Pembayaran gagal/expired | Booking tidak confirmed; kuota kembali setelah hold habis |
| UAT-06 | Webhook duplikat | Tidak ada pembayaran ganda; status tetap benar |
| UAT-07 | Pelanggan membatalkan booking pending | Status cancelled; kuota kembali |
| UAT-08 | Pelanggan mengajukan pembatalan booking confirmed | Masuk antrean ops; refund sesuai kebijakan |
| UAT-09 | Admin refund | Payment refunded; booking refunded; audit log tercatat |
| UAT-10 | Pelanggan A membuka booking pelanggan B | 404/403; data tidak bocor |
| UAT-11 | Admin content membuka modul ops | 403 |
| UAT-12 | Halaman publik di mobile 390 px | Tidak ada horizontal scroll; CTA dapat digunakan |
| UAT-13 | Keyboard-only checkout | Semua field dan tombol dapat dioperasikan |
| UAT-14 | Restore backup ke staging | Data booking/payment utuh |
| UAT-15 | Produksi: akses `/dev/payments/:ref/pay` | Ditolak |

---

## 10. Checklist go-live

### Keamanan

- [ ] `SERVER_ENV=production`.
- [ ] `JWT_SECRET` dan `PAYMENT_GATEWAY_SECRET` dirotasi dan bukan default.
- [ ] `ALLOWED_ORIGINS` hanya domain produksi.
- [ ] Endpoint `/dev/*` dan simulasi pembayaran nonaktif.
- [ ] Reset token tidak muncul di response.
- [ ] HTTPS aktif, HSTS aktif, certificate valid.
- [ ] Tidak ada secret di repository atau bundle frontend.
- [ ] Dependency audit bersih dari isu kritis.
- [ ] Akses database dibatasi.
- [ ] Akun demo dinonaktifkan/dihapus.

### Fungsional

- [ ] Paket, harga, jadwal, dan kuota benar.
- [ ] Booking, pembayaran, voucher, cancel, refund lulus UAT.
- [ ] Email transaksional terkirim.
- [ ] Webhook events dapat dibaca di admin.
- [ ] Export CSV benar.
- [ ] RBAC sesuai matriks.
- [ ] 404/500 memiliki halaman yang ramah.

### Operasional

- [ ] Backup harian berjalan.
- [ ] Restore diuji.
- [ ] Monitoring dan alert aktif.
- [ ] Runbook diperbarui.
- [ ] Kontak on-call jelas.
- [ ] Rollback plan diuji.
- [ ] Domain, DNS, dan SSL dikelola.
- [ ] Log retention ditetapkan.

### Konten dan legal

- [ ] Halaman syarat, privasi, pembatalan, dan keselamatan disetujui.
- [ ] Foto memiliki hak pakai.
- [ ] Tidak ada teks placeholder.
- [ ] Kebijakan retensi data kesehatan jelas.
- [ ] Kontak bisnis benar.

### Rilis

- [ ] Staging dan produksi memakai konfigurasi terpisah.
- [ ] Deploy terakhir lulus CI.
- [ ] Smoke test produksi lulus.
- [ ] Tim internal diberi tahu.
- [ ] Hypercare 7 hari dijadwalkan.

---

## 11. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Approval payment gateway lama | Go-live tertunda | Mulai pendaftaran vendor di hari 1; siapkan mock hanya untuk demo |
| Email masuk spam | Pelanggan tidak menerima voucher | Set SPF/DKIM/DMARC; uji deliverability; gunakan provider reputasi baik |
| Konten/legal belum siap | Tidak bisa publik | Tetapkan owner konten dan deadline review |
| Scope creep | Finishing tidak selesai | Feature freeze; semua ide baru masuk backlog P2 |
| Bug regresi | Kerusakan alur booking | E2E/CI dan regression sebelum deploy |
| Data QA terbawa produksi | Data kotor/kebocoran | Seed produksi terpisah; checklist data |
| Tidak ada backup valid | Kehilangan data | Uji restore, bukan hanya membuat backup |
| Solo developer | Burnout/terlambat | Prioritaskan P0, buffer 20%, otomasi hal rutin |

---

## 12. Metrik pasca-launch

Pantau minimal selama 30 hari:

- conversion rate katalog → checkout;
- checkout → pembayaran sukses;
- payment failure rate per metode;
- jumlah webhook gagal/tertunda;
- error rate 5xx;
- LCP/CLS/INP mobile;
- uptime;
- jumlah tiket support per 100 booking;
- waktu respons refund;
- jumlah booking yang hold-nya expired.

Hypercare 7 hari:

- [ ] Review error tracking setiap hari.
- [ ] Review pembayaran tertunda setiap hari.
- [ ] Cek backup dan alert.
- [ ] Kumpulkan feedback admin.
- [ ] Perbaiki bug kecil dengan hotfix terkontrol.

---

## 13. First action items

Jika eksekusi dimulai hari ini:

1. Tentukan target rilis dan vendor payment gateway.
2. Buat branch `chore/finishing` dan staging environment.
3. Tutup FIND-01 (reset token) sebagai perbaikan pertama.
4. Perbaiki FIND-02 (webhook base64).
5. Siapkan adapter payment sandbox.
6. Konfigurasikan email provider.
7. Jalankan ulang test plan dan UAT.

---

## 14. Ringkasan status

| Kategori | Status |
| --- | --- |
| Fitur inti | Sebagian besar sudah ada |
| Keamanan | Ada 1 blocker S1; hardening sesi belum selesai |
| Pembayaran | Masih mock; belum siap produksi |
| Email | Bergantung konfigurasi SMTP; belum diuji deliverability |
| Admin | Berfungsi; webhook events perlu diperbaiki |
| Testing | Unit backend lulus; E2E/CI belum ada |
| Performa | Belum diukur |
| Aksesibilitas | Belum diaudit |
| Operasional | Backup/monitoring/runbook produksi belum lengkap |
| Kesiapan go-live | Belum siap; estimasi 3–4 minggu |
