# Rinjani Travel

Platform pemesanan langsung untuk paket trekking Gunung Rinjani dan wisata Lombok. Repositori ini berisi frontend React/Vite dan backend Go/Gin + MySQL untuk MVP sesuai `PRD.md`.

## Fitur utama

- Katalog publik: beranda, pencarian/filter paket, detail paket, jadwal keberangkatan, galeri, FAQ, halaman informasi, dan kontak.
- Akun pelanggan: registrasi, login, verifikasi email, lupa/reset kata sandi, profil, dan keamanan akun.
- Checkout: harga dihitung server, kupon, add-on, hold kuota atomik, dan idempotency key.
- Pembayaran: adapter gateway mock dengan webhook HMAC-SHA256, idempotensi event, rekonsiliasi manual, refund, dan simulasi pembayaran khusus development.
- Dashboard pelanggan: daftar pesanan, detail, voucher, pembayaran, pembatalan, dan ulasan setelah perjalanan selesai.
- Admin RBAC: dashboard operasional, pesanan, pembayaran, paket, jadwal, pelanggan, kupon, ulasan, konten/FAQ, pesan, staf, pengaturan, dan audit log.
- Keamanan dasar: JWT, RBAC backend, rate limiting, security headers, CORS terbatas, request ID, dan validasi input server.

## Struktur repositori

```text
backend/
  cmd/                 entrypoint server
  internal/
    config/            environment + koneksi database
    handlers/          HTTP handlers
    middleware/        auth, RBAC, rate limit, security headers
    migrations/        AutoMigrate
    models/            entitas GORM
    routes/            peta route API
    seeders/           data demo
    server/            inisialisasi Gin
    services/          aturan bisnis booking, pembayaran, email
    utils/             response envelope, helper
  docs/openapi.yaml    kontrak API
frontend/
  src/
    components/        layout, UI primitives, guard
    context/           AuthContext
    lib/               format & status helper
    pages/             halaman publik, akun, auth, admin
    services/api.js    klien API
docs/RUNBOOK.md        prosedur operasional
```

## Prasyarat

- Node.js 20+ dan npm
- Go 1.26+
- MySQL 8+

## Menjalankan secara lokal

### 1. Database

Buat database MySQL:

```sql
CREATE DATABASE rinjani_travel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# sesuaikan DB_*, JWT_SECRET, dan variabel lain
go run ./cmd
```

Server berjalan di `http://localhost:8000`. Migrasi dan seeder dijalankan otomatis saat start. Seeder tidak menimpa data yang sudah ada.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. Frontend memakai `VITE_API_URL` (default `http://localhost:8000/api/v1`).

Tema terang/gelap dapat diganti dari header publik, panel admin, atau halaman autentikasi. Pilihan disimpan di `localStorage` (`rinjani_theme`); kunjungan pertama mengikuti preferensi sistem.

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000/api/v1
```

## Akun demo

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Super Admin | `superadmin@rinjanitravel.com` | `Admin123!` |
| Admin Operasional | `ops@rinjanitravel.com` | `Admin123!` |
| Admin Konten | `content@rinjanitravel.com` | `Admin123!` |
| Pelanggan | `customer@example.com` | `Customer123!` |

Ganti seluruh akun dan rahasia demo sebelum produksi.

## Perintah penting

```bash
# backend
cd backend
go build ./...
go test ./internal/services/...
go vet ./...

# frontend
cd frontend
npm run build
npm run lint
```

## Alur pembayaran development

1. Pelanggan membuat pesanan; kuota ditahan selama `BOOKING_HOLD_MINUTES` (default 30 menit).
2. Pelanggan membuat instruksi pembayaran di halaman pesanan.
3. Di development, tombol **Simulasikan pembayaran** memanggil `POST /api/v1/dev/payments/:ref/pay`. Endpoint ini membuat payload webhook bertanda tangan HMAC dan memprosesnya melalui jalur yang sama dengan webhook produksi.
4. Booking berubah menjadi `paid` lalu `confirmed`; kuota tetap terpakai dan email transaksi dicatat.

Endpoint simulasi dan halaman `/payment/simulate` otomatis ditolak saat `SERVER_ENV=production`.

## Dokumentasi API

- Spesifikasi OpenAPI: [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml)
- Envelope response: `{"meta":{"status":"success|error","message":"...","code":200},"data":...}`
- Response berpaginasi: `data.items`, `data.total`, `data.page`, `data.page_size`, `data.total_pages`

## Deployment ringkas

Gunakan Docker Compose untuk lingkungan demo/staging:

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000`
- MySQL: port `3306` (volume persisten)

Untuk produksi, wajib mengganti semua secret, mengaktifkan HTTPS, mengatur `ALLOWED_ORIGINS`, menggunakan gateway pembayaran nyata, dan mengikuti [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

## Lisensi

Proyek internal Rinjani Travel. Aset gambar dan konten tidak boleh digunakan ulang tanpa izin.
