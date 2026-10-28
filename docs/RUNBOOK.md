# Runbook Operasional — Rinjani Travel

Dokumen ini menjelaskan prosedur operasional untuk menjalankan, memantau, dan menangani insiden pada platform Rinjani Travel. Ganti semua nilai contoh (domain, kontak, kredensial) dengan nilai produksi organisasi.

## 1. Ringkasan sistem

| Komponen | Teknologi | Port default |
| --- | --- | --- |
| Frontend | React 18 + Vite | 5173 (dev), 8080 (Docker) |
| Backend API | Go + Gin | 8000 |
| Database | MySQL 8 | 3306 |
| Pembayaran | Adapter gateway (mock di development) | — |

Endpoint health: `GET /api/v1/health`. Response `status: ok` berarti API dan koneksi database sehat; `degraded` berarti database tidak dapat dijangkau.

## 2. Mulai dan hentikan layanan

### Development

```bash
# Backend
cd backend
go run ./cmd

# Frontend (terminal terpisah)
cd frontend
npm run dev
```

### Docker Compose

```bash
docker compose up --build -d
docker compose logs -f backend
docker compose ps
docker compose down
```

### Produksi

Gunakan process manager/systemd atau orchestrator. Pastikan:

- `SERVER_ENV=production`
- `JWT_SECRET` acak minimal 32 byte dan tidak sama dengan nilai development
- `PAYMENT_GATEWAY_SECRET` dari dashboard gateway
- `ALLOWED_ORIGINS` hanya berisi origin frontend resmi
- HTTPS aktif di reverse proxy
- `DB_*` menunjuk database produksi dengan backup otomatis

## 3. Pemeriksaan harian

1. Cek health endpoint dan status container/proses.
2. Cek dashboard admin: booking hari ini, pembayaran menunggu, keberangkatan mendatang, dan tugas.
3. Tinjau `payment_events` untuk event gagal (`processed=false`) atau signature invalid.
4. Pastikan worker expiry berjalan; booking `pending_payment` yang lewat tenggat harus menjadi `payment_expired` dan kuota dilepas.
5. Cek antrean pesan kontak dan ulasan yang menunggu moderasi.
6. Verifikasi backup database terbaru.

## 4. Prosedur booking

### Booking baru

1. Pelanggan membuat pesanan; sistem menahan kuota secara atomik.
2. Status awal `pending_payment`, dengan `expires_at` sesuai `BOOKING_HOLD_MINUTES`.
3. Pelanggan membuat instruksi pembayaran.
4. Pembayaran terverifikasi mengubah status menjadi `paid` lalu `confirmed` (otomatis atau oleh admin ops).
5. Kirim/ulangi invoice melalui detail booking admin bila diperlukan.

### Booking macet atau gagal bayar

1. Buka **Admin → Pesanan**, cari kode booking.
2. Periksa riwayat status dan pembayaran.
3. Jika sudah lewat tenggat, tunggu worker expiry (maksimal 1 menit) atau ubah status ke `payment_expired` dengan alasan.
4. Jika pelanggan masih ingin melanjutkan, minta membuat pesanan baru setelah kuota dilepas. Jangan mengubah `expires_at` secara manual tanpa persetujuan.

### Perubahan status manual

Hanya transisi berikut yang diizinkan:

```text
draft → pending_payment / cancelled
pending_payment → paid / payment_expired / cancelled
paid → confirmed / refunded / cancelled
confirmed → completed / cancelled / refunded
completed → refunded
payment_expired → cancelled
cancelled → refunded
```

Setiap perubahan wajib menyertakan alasan dan akan tercatat di riwayat booking serta audit log.

## 5. Prosedur pembayaran

### Pembayaran berhasil tetapi booking belum berubah

1. Cek **Admin → Pembayaran** dan **Webhook events** berdasarkan referensi gateway.
2. Pastikan event `processed=true` dan signature valid.
3. Jika event gagal, periksa log backend untuk pesan error (nominal tidak cocok, booking tidak ditemukan, signature invalid).
4. Jika gateway sudah mengonfirmasi pembayaran tetapi webhook tidak masuk, gunakan **Catat pembayaran** manual di detail booking dengan nominal dan catatan rekonsiliasi. Tindakan ini tercatat di audit log.
5. Jangan pernah menandai lunas hanya berdasarkan screenshot/return URL pelanggan.

### Refund

1. Verifikasi kebijakan pembatalan dan status booking.
2. Proses refund di dashboard gateway terlebih dahulu.
3. Catat refund di **Admin → Pembayaran → Refund** dengan alasan.
4. Status booking menjadi `refunded`; kuota tidak otomatis kembali untuk booking yang sudah `confirmed` — koordinasikan dengan operasional jika kursi akan dijual kembali.
5. Simpan bukti refund pada catatan internal booking.

### Event webhook duplikat

Sistem menyimpan `event_id` unik dan mengembalikan sukses tanpa memproses ulang. Tidak perlu tindakan manual. Jika terjadi duplikasi efek, eskalasi sebagai insiden dan periksa `payment_events`.

## 6. Prosedur pembatalan dan reschedule

### Pembatalan oleh pelanggan

1. Pelanggan dapat membatalkan dari halaman pesanan selama status `pending_payment`, `paid`, atau `confirmed`.
2. Sistem melepas kuota untuk booking yang belum `paid`/`confirmed` dan menandai pembayaran pending sebagai expired.
3. Untuk booking yang sudah dibayar, tim ops memproses refund sesuai kebijakan.

### Reschedule

1. Pastikan jadwal tujuan memiliki kuota.
2. Buat booking baru atau ubah jadwal sesuai kebijakan internal; jangan mengedit tanggal pada booking lama tanpa jejak audit.
3. Catat alasan dan persetujuan pelanggan pada catatan internal.

## 7. Insiden overbooking

Gejala: jumlah peserta pada jadwal melebihi kapasitas, atau dua booking mendapat kursi yang sama.

1. Hentikan sementara perubahan jadwal terkait.
2. Identifikasi semua booking pada jadwal tersebut dan statusnya.
3. Prioritaskan booking yang sudah `paid`/`confirmed`; tawarkan reschedule atau refund untuk sisanya.
4. Catat setiap keputusan pada catatan internal dan audit log.
5. Periksa log transaksi/lock database dan jalankan UAT konkurensi sebelum membuka kembali penjualan.
6. Eskalasi ke engineering dengan kode booking, ID jadwal, waktu kejadian, dan log terkait.

## 8. Konten dan katalog

1. Perubahan paket, jadwal, harga, dan konten dilakukan melalui admin; tidak perlu deploy frontend.
2. Gunakan status `draft` untuk perubahan besar, lalu `published` setelah diverifikasi operator.
3. Periksa gambar (path/URL valid), itinerary, fasilitas, kebijakan pembatalan, dan SEO sebelum publish.
4. Untuk penutupan jalur/cuaca ekstrem, tutup jadwal terkait dan hubungi pelanggan yang sudah memesan.

## 9. Backup dan pemulihan

### Backup harian

```bash
mysqldump --single-transaction --routines --triggers \
  -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" \
  | gzip > "backup-$(date +%F-%H%M).sql.gz"
```

Simpan di lokasi terpisah dengan retensi minimal 14 hari dan enkripsi at-rest.

### Restore (hati-hati, hanya saat insiden)

```bash
gunzip -c backup-YYYY-MM-DD-HHMM.sql.gz | mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME"
```

Setelah restore: jalankan health check, verifikasi login admin, cek beberapa booking/pembayaran terakhir, dan pastikan worker expiry aktif.

## 10. Insiden keamanan

1. Rotasi segera `JWT_SECRET`, `PAYMENT_GATEWAY_SECRET`, kredensial database, dan kredensial email jika dicurigai bocor.
2. Nonaktifkan akun staf yang terdampak melalui **Admin → Staf**.
3. Tinjau audit log dan log akses web server.
4. Periksa apakah data kesehatan/pelanggan terekspos; ikuti prosedur notifikasi insiden organisasi.
5. Jangan menghapus log sebelum investigasi selesai.

## 11. Deployment dan rollback

### Sebelum deploy

```bash
cd backend && go test ./internal/services/... && go build ./...
cd ../frontend && npm run build
```

### Deploy

1. Backup database.
2. Deploy backend baru; migrasi berjalan otomatis saat start.
3. Deploy frontend build.
4. Cek health endpoint, login admin, katalog, dan satu alur checkout di staging.
5. Pantau error rate dan webhook selama 30 menit pertama.

### Rollback

1. Kembalikan image/build sebelumnya.
2. Jika migrasi bersifat destruktif, pulihkan dari backup — jangan mengandalkan rollback kode saja.
3. Verifikasi health, login, dan data booking setelah rollback.

## 12. Kontak eskalasi

| Peran | Nama | Kontak |
| --- | --- | --- |
| Owner operasional | _isi_ | _isi_ |
| Engineering on-call | _isi_ | _isi_ |
| Payment gateway support | _isi_ | _isi_ |
| Hosting/database support | _isi_ | _isi_ |

## 13. Checklist go-live

- [ ] Seluruh secret produksi diatur di secret manager, bukan repository.
- [ ] HTTPS dan `ALLOWED_ORIGINS` produksi benar.
- [ ] Gateway pembayaran produksi aktif dan webhook terdaftar.
- [ ] Uji webhook sukses, gagal, duplikat, dan refund.
- [ ] UAT booking, overbooking, expiry, pembatalan, dan reschedule.
- [ ] Backup otomatis dan prosedur restore diuji.
- [ ] Monitoring uptime, error tracking, dan alert webhook aktif.
- [ ] Konten paket, harga, kebijakan, dan halaman legal disetujui operator.
- [ ] Akun demo dinonaktifkan atau kata sandinya diganti.
