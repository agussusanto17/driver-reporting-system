# PRD — Driver Reporting System

**Sistem Pelaporan & Monitoring Pengiriman Barang**

| | |
|---|---|
| **Version** | 1.0 |
| **Tanggal** | 23 April 2026 |
| **Status** | Draft |
| **Author** | [Nama Product Owner] |
| **Stakeholders** | Product Owner, UI/UX Designer, Frontend Dev, Backend Dev, QA |

---

## 1. Executive Summary

Saat ini proses pelaporan pengiriman barang dilakukan manual via grup WhatsApp — driver foto muatan saat pickup dan drop, kirim ke group chat, dengan validasi lokasi mengandalkan geo-tag kamera HP. Masalahnya: data tidak terstruktur, sulit dilacak, tidak ada monitoring real-time, dan rawan human error (lupa aktifkan geo-tag, foto tenggelam di chat).

Dokumen ini mendefinisikan kebutuhan **Driver Reporting System** yang terdiri dari **PWA mobile-first untuk driver** dan **Dashboard Admin** untuk tim operasional. Sistem ini mendigitalisasi seluruh proses pelaporan dengan GPS enforcement otomatis dan data terstruktur yang bisa di-export.

---

## 2. Problem Statement

| Masalah Saat Ini | Dampak |
|---|---|
| Laporan via WhatsApp group, tidak terstruktur | Sulit lacak histori per driver/kendaraan |
| Geo-tag bergantung setting kamera HP driver | Tidak ada jaminan validasi lokasi — driver bisa lupa aktifkan |
| Foto & data tersebar di chat tanpa indexing | Admin kesulitan monitoring & buat laporan |
| Tidak ada kompresi foto | Konsumsi data tinggi, terutama di jaringan lemah |
| Tidak ada export data | Rekap manual memakan waktu & rawan salah |

---

## 3. Goals & Success Metrics

### 3.1 Goals

| ID | Goal |
|---|---|
| G1 | Digitalisasi pelaporan driver dari WhatsApp ke sistem web (PWA) |
| G2 | Setiap laporan punya geo-tag valid secara otomatis (GPS-enforced, bukan dari kamera) |
| G3 | Dashboard admin untuk monitoring real-time + filter + export |
| G4 | Kompresi foto otomatis agar ringan di jaringan terbatas |

### 3.2 Success Metrics

| Metric | Cara Ukur | Target |
|---|---|---|
| 100% laporan punya geo-tag valid | Sistem tolak submit tanpa GPS | Sejak launch |
| Waktu submit < 2 menit | Buka app → laporan terkirim | Bulan ke-1 |
| Adopsi driver ≥ 90% | Driver aktif pakai sistem vs WA | Bulan ke-2 |
| Waktu rekap admin turun 70% | vs proses manual sebelumnya | Bulan ke-2 |

---

## 4. User Personas

### 4.1 Driver

| Aspek | Detail |
|---|---|
| Profil | Driver truck/kurir pengiriman antar kota |
| Device | Android mid-range, koneksi seluler (tidak selalu stabil) |
| Tech Literacy | Basic — familiar WA & kamera, tidak terbiasa app kompleks |
| Kebutuhan | Proses laporan cepat, simpel, minim langkah |
| Pain Point | Jaringan lambat di perjalanan, kesulitan isi banyak form |

### 4.2 Admin Operasional

| Aspek | Detail |
|---|---|
| Profil | Staff operasional / dispatcher di kantor pusat |
| Device | Laptop/desktop, koneksi stabil |
| Tech Literacy | Menengah — familiar spreadsheet & tools kantor |
| Kebutuhan | Monitoring real-time, buat laporan periodik |
| Pain Point | Scroll WA cari data, rekap manual ke Excel |

---

## 5. User Stories & Acceptance Criteria

### 5.1 Web App Driver (PWA — Mobile View)

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-01 | Sebagai driver, saya ingin login agar laporan tercatat atas nama saya | Login username/password. Session persist hingga logout. Tampil nama & nopol setelah login. | Must Have |
| US-02 | Sebagai driver, saya ingin buat laporan perjalanan dengan detail rute | Input: Nopol (pre-filled), Tipe (Pickup/Drop), Kota Asal, Kota Tujuan, Keterangan (opsional). Support multiple tujuan dalam 1 perjalanan. | Must Have |
| US-03 | Sebagai driver, saya ingin upload foto muatan sebagai bukti | Foto dari kamera atau galeri. Kompresi otomatis < 500KB. Preview sebelum submit. Min 1 foto wajib. | Must Have |
| US-04 | Sebagai driver, saya ingin lokasi otomatis tercatat saat lapor | Tombol submit **TERKUNCI** jika GPS off. Pesan: "Aktifkan GPS untuk mengirim laporan". Koordinat lat/long auto-save. Nama lokasi (reverse geocoding) ditampilkan. | Must Have |
| US-05 | Sebagai driver, saya ingin lihat riwayat laporan saya | List urut terbaru. Tampil tanggal, tipe, rute. Tap untuk detail & foto. | Should Have |

### 5.2 Dashboard Admin

| ID | User Story | Acceptance Criteria | Priority |
|---|---|---|---|
| US-06 | Sebagai admin, saya ingin lihat semua laporan masuk real-time | Feed terbaru auto-refresh. Setiap entry: Waktu, Driver, Nopol, Tipe, Rute, Thumbnail. Indikator laporan baru. | Must Have |
| US-07 | Sebagai admin, saya ingin lihat lokasi foto di peta | Klik laporan → peta (Leaflet + OpenStreetMap). Pin marker di koordinat. Popup: alamat, waktu, foto. | Must Have |
| US-08 | Sebagai admin, saya ingin filter laporan per Nopol & tanggal | Filter: Nopol (searchable dropdown), Date Range, Tipe, Driver. Bisa dikombinasi. Update instan. | Must Have |
| US-09 | Sebagai admin, saya ingin export data ke Excel | Tombol Export mengikuti filter aktif. Kolom: Tanggal, Driver, Nopol, Tipe, Rute, Koordinat, Link Foto. Format .xlsx. | Must Have |
| US-10 | Sebagai admin, saya ingin kelola data driver & kendaraan | CRUD Driver: Nama, Username, Password, Assign Nopol. CRUD Kendaraan: Nopol, Jenis, Status. | Should Have |

---

## 6. Functional Requirements

### 6.1 Autentikasi & Session

| ID | Requirement |
|---|---|
| FR-01 | Login username + password |
| FR-02 | Token-based auth (JWT), session persist di browser |
| FR-03 | Role-based access: Driver → PWA, Admin → Dashboard |
| FR-04 | Logout manual di kedua platform |

### 6.2 Geo-Tagging & Validasi Lokasi

| ID | Requirement |
|---|---|
| FR-05 | Minta izin akses lokasi (Geolocation API) saat pertama digunakan |
| FR-06 | Tombol "Kirim Laporan" **disabled** jika GPS off / izin ditolak |
| FR-07 | Pesan error jelas jika GPS off: "Aktifkan lokasi/GPS di pengaturan HP Anda" |
| FR-08 | Koordinat diambil dari **Geolocation API browser** — bukan EXIF foto. Memastikan lokasi valid meskipun kamera HP tidak support geo-tag |
| FR-09 | Akurasi diterima: ≤ 100m. Jika rendah → warning, tapi tetap izinkan submit |
| FR-10 | Reverse geocoding tampilkan nama lokasi sebagai konfirmasi sebelum submit |

### 6.3 Upload Foto & Kompresi

| ID | Requirement |
|---|---|
| FR-11 | Ambil foto dari kamera (input capture) atau pilih galeri |
| FR-12 | Kompresi otomatis client-side, target < 500KB (canvas API / browser-image-compression) |
| FR-13 | Format output: JPEG quality 0.6–0.8 |
| FR-14 | Min 1 foto wajib, max 5 foto per laporan |
| FR-15 | Preview thumbnail + opsi hapus/ganti sebelum submit |
| FR-16 | Progress indicator saat upload |

### 6.4 Laporan Perjalanan

| ID | Requirement |
|---|---|
| FR-17 | Form: Nopol (pre-filled, bisa ubah), Tipe (Pickup/Drop), Kota Asal, Kota Tujuan, Foto (wajib), Catatan (opsional) |
| FR-18 | Support multiple drop dalam 1 perjalanan |
| FR-19 | Auto-save per laporan: Timestamp, Koordinat GPS, Nama Lokasi, ID Driver, Nopol |
| FR-20 | Konfirmasi sukses + summary setelah submit |
| FR-21 | Halaman riwayat laporan, urut terbaru |

### 6.5 Dashboard Admin

| ID | Requirement |
|---|---|
| FR-22 | Feed laporan terbaru, auto-refresh 30 detik atau WebSocket |
| FR-23 | Card: Timestamp, Driver, Nopol, Tipe, Rute (Asal → Tujuan), Thumbnail |
| FR-24 | Detail view: Foto full-size + Peta (Leaflet/OSM) dengan pin koordinat |
| FR-25 | Filter kombinasi: Nopol, Date Range, Tipe, Driver |
| FR-26 | Export .xlsx sesuai filter aktif. Kolom: No, Tanggal, Driver, Nopol, Tipe, Asal, Tujuan, Lat, Long, Lokasi, Link Foto, Catatan |
| FR-27 | Manajemen master: CRUD Driver & Kendaraan |

---

## 7. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Performance | PWA load < 3 detik (3G). Upload foto < 5 detik (4G). Dashboard load < 2 detik |
| Availability | Uptime 99.5%. Downtime terjadwal 22:00–05:00 WIB |
| Security | HTTPS wajib. Password hash bcrypt. JWT expiry 7 hari. Rate limiting login API |
| Scalability | Min 50 driver aktif bersamaan (fase awal) |
| Compatibility | PWA: Chrome Android 80+, Safari iOS 14+. Dashboard: Chrome/Firefox/Edge terbaru |
| PWA | Installable (A2HS). Offline indicator. Service Worker caching asset statis |
| Data Retention | Simpan min 12 bulan. Archiving policy untuk data > 12 bulan |

---

## 8. Technical Stack (DECIDED)

Stack telah diputuskan berdasarkan constraint shared hosting dengan Node.js support.

> **Arsitektur: Next.js Fullstack (Monorepo)**
> Satu codebase untuk PWA Driver + Dashboard Admin + API Backend. Dipilih karena skala aplikasi internal yang kecil (~50 driver), meminimalkan complexity deployment di shared hosting, dan zero additional cost untuk third-party services.

| Komponen | Teknologi | Catatan |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Fullstack — SSR/CSR + API Routes dalam satu codebase |
| **Authentication** | NextAuth.js / Auth.js | JWT session, role-based (driver/admin) |
| **ORM** | Prisma | Type-safe, auto migration, schema management |
| **Database** | MySQL | Bawaan shared hosting, gratis |
| **File Storage** | Local Filesystem (server disk) | Simpan di `/uploads/[tahun]/[bulan]/[tanggal]/`. Estimasi ~3.5GB/bulan. Zero cost |
| **Peta** | Leaflet.js + OpenStreetMap | Gratis, tanpa API key |
| **Export Excel** | SheetJS (xlsx) | Client-side export, ringan |
| **Kompresi Foto** | browser-image-compression | Client-side, target < 500KB per foto |
| **PWA** | next-pwa / Serwist | Installable (A2HS), Service Worker, offline indicator |
| **Reverse Geocoding** | OpenStreetMap Nominatim | Gratis, open-source, dipanggil client-side |

### 8.1 Project Structure

```
src/
├── app/
│   ├── (driver)/          # PWA Driver (mobile-first)
│   │   ├── login/         # Halaman login
│   │   └── report/
│   │       ├── new/       # Form buat laporan baru
│   │       └── history/   # Riwayat laporan
│   ├── (admin)/           # Dashboard Admin
│   │   └── dashboard/     # Monitoring, filter, export
│   └── api/               # API Routes
│       ├── auth/          # NextAuth endpoints
│       ├── reports/       # CRUD laporan
│       └── uploads/       # Serve foto dari disk
├── components/            # Reusable components
├── lib/                   # Utilities (prisma, auth, upload)
└── types/                 # TypeScript type definitions
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed data
uploads/                   # Photo storage (gitignored)
```

### 8.2 Hosting & Deployment

| Aspek | Detail |
|---|---|
| Server | Shared hosting dengan Node.js support |
| Database | MySQL bawaan hosting (gratis) |
| File Storage | Local disk server — folder `/uploads/` harus persistent (tidak ke-reset saat deploy ulang) |
| Estimasi Disk | ~125MB/hari (50 driver × 5 laporan × 500KB foto). ~3.5GB/bulan |
| Backup | Pastikan folder `/uploads/` ikut ter-backup oleh hosting |
| Biaya Tambahan | **Rp 0** — semua library dan service gratis / open-source |

### 8.3 Data Model (Prisma)

| Tabel | Kolom Utama | Keterangan |
|---|---|---|
| users | id, name, username, password_hash, role (DRIVER/ADMIN), vehicle_id (FK), created_at | Data user driver & admin |
| vehicles | id, plate_number, type, is_active, created_at | Master data kendaraan |
| reports | id, user_id (FK), vehicle_id (FK), report_type (PICKUP/DROP), origin_city, destination_city, lat, long, location_name, accuracy, notes, created_at | Data laporan perjalanan |
| report_photos | id, report_id (FK), file_path, original_size, compressed_size, created_at | Metadata foto, file_path mengarah ke /uploads/ |

---

## 9. User Flow

### 9.1 Flow Driver — Submit Laporan

| Step | Deskripsi |
|---|---|
| 1 | Buka PWA → Login (jika belum ada session) |
| 2 | Tap "+ Buat Laporan" |
| 3 | Sistem cek GPS. OFF → pesan error, submit disabled |
| 4 | GPS ON → form aktif. Isi: Tipe, Kota Asal, Kota Tujuan |
| 5 | Ambil/pilih foto → kompresi otomatis |
| 6 | Preview: form + foto + lokasi terdeteksi |
| 7 | Tap "Kirim Laporan" → data + foto + koordinat → server |
| 8 | Konfirmasi sukses → buat laporan baru atau ke beranda |

### 9.2 Flow Admin — Monitoring & Export

| Step | Deskripsi |
|---|---|
| 1 | Login Dashboard |
| 2 | Feed laporan terbaru (auto-refresh) |
| 3 | Klik laporan → detail: foto + peta lokasi |
| 4 | Filter: Nopol, tanggal, tipe |
| 5 | Export Excel → download .xlsx sesuai filter |

---

## 10. Scope & Phases

### 10.1 Phase 1 — MVP (4–6 Minggu)

| Komponen | Fitur |
|---|---|
| PWA Driver | Login, Submit laporan + foto, GPS enforcement, Kompresi foto, Riwayat laporan |
| Dashboard | Feed real-time, Detail + peta, Filter Nopol/Tanggal, Export Excel |
| Backend | Auth JWT, CRUD Reports, File upload, CRUD Master Data |

### 10.2 Phase 2 — Enhancement (Post-MVP)

| ID | Enhancement |
|---|---|
| E-01 | Push notification ke admin saat laporan baru masuk |
| E-02 | Offline mode — simpan lokal, auto-sync saat online |
| E-03 | Dashboard analytics: trip per driver, rata-rata waktu kirim |
| E-04 | Multi-foto viewer carousel di detail admin |
| E-05 | Trip grouping — kelompokkan pickup & drop dalam 1 perjalanan |
| E-06 | Audit trail — log aktivitas user |

---

## 11. Out of Scope (MVP)

| No | Item |
|---|---|
| 1 | Live GPS tracking continuous |
| 2 | Chat/messaging driver ↔ admin dalam app |
| 3 | Integrasi ERP/WMS pihak ketiga |
| 4 | Notifikasi SMS/WA otomatis ke pelanggan |
| 5 | Multi-tenant / multi-cabang |
| 6 | Native mobile app (pakai PWA) |

---

## 12. Risks & Mitigations

| Risk | Mitigation | Severity |
|---|---|---|
| Driver tidak mau adopt, tetap pakai WA | UX < 3 tap submit. Training singkat. Matikan WA channel bertahap | High |
| GPS tidak akurat (gedung, basement) | Threshold ≤100m. Warning jika rendah, tetap izinkan submit | Medium |
| Koneksi tidak stabil di perjalanan | Kompresi client-side. Phase 2: offline mode + local queue | Medium |
| Fake GPS / manipulasi lokasi | Phase 2: deteksi mock location. MVP: review manual admin | Low |

---

## 13. Open Questions

| No | Pertanyaan | Status |
|---|---|---|
| 1 | Perlu approval workflow? (admin verify setiap laporan) | Keputusan stakeholder |
| 2 | Berapa lama data & foto disimpan sebelum archive? | Tentukan retention policy |
| 3 | Driver bisa berganti kendaraan (ganti nopol)? | Klarifikasi proses ops |
| 4 | Perlu fitur komentar admin ke laporan driver? | Masuk Phase 2? |
| 5 | ~~Hosting: cloud (AWS/GCP) atau on-premise?~~ | **DECIDED** — Shared hosting + Node.js + MySQL + local disk |