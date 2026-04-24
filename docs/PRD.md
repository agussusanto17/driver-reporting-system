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
| US-03 | Sebagai driver, saya ingin upload foto muatan sebagai bukti | Foto dari kamera atau galeri. Kompresi otomatis < 300KB. Preview sebelum submit. Min 1 foto wajib. | Must Have |
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
| FR-12 | Kompresi otomatis client-side, target < 300KB (canvas API / browser-image-compression) |
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
| **Kompresi Foto** | browser-image-compression | Client-side, target < 300KB per foto |
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
| Estimasi Disk | ~125MB/hari (50 driver × 5 laporan × 300KB foto). ~3.5GB/bulan |
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

---

## 14. Design System

Design system mengacu pada branding [truckinc.id](https://truckinc.id/) — memastikan konsistensi visual antara website perusahaan dan aplikasi internal.

### 14.1 Color Palette

**Primary Colors — derived from Truckinc brand identity:**

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-primary` | `#051E4B` | Deep navy — header, sidebar admin, teks utama. Warna dominan brand Truckinc |
| `--color-primary-600` | `#0A2E72` | Hover state untuk elemen primary |
| `--color-primary-400` | `#1A4A9E` | Active state, secondary navigation |
| `--color-primary-100` | `#E5ECF8` | Background ringan, card hover state |

**Accent Colors — Truckinc gold:**

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-accent` | `#E2B746` | Gold — CTA buttons, badge, indikator penting. Warna aksen utama dari brand Truckinc |
| `--color-accent-600` | `#C9A33D` | Hover state accent |
| `--color-accent-400` | `#ECC96B` | Lighter accent untuk highlight |
| `--color-accent-100` | `#FBF3D9` | Background accent ringan |

**Semantic Colors:**

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-success` | `#16A34A` | Laporan berhasil terkirim, GPS aktif, status aktif |
| `--color-warning` | `#EAB308` | Akurasi GPS rendah, warning state |
| `--color-danger` | `#DC2626` | GPS off / error, validasi gagal, hapus data |
| `--color-info` | `#2563EB` | Informasi, link, laporan baru masuk |

**Neutral Colors:**

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-gray-900` | `#111827` | Heading text, body text utama |
| `--color-gray-600` | `#4B5563` | Secondary text, label form |
| `--color-gray-400` | `#9CA3AF` | Placeholder, disabled text, caption |
| `--color-gray-200` | `#E5E7EB` | Border, divider |
| `--color-gray-100` | `#F3F4F6` | Background halaman, card background admin |
| `--color-white` | `#FFFFFF` | Card, form, content area |

### 14.2 Typography

| Elemen | Font | Weight | Size | Catatan |
|---|---|---|---|---|
| Heading 1 (page title) | Inter | 700 (Bold) | 24px / 1.5rem | Digunakan di judul halaman |
| Heading 2 (section title) | Inter | 600 (Semibold) | 20px / 1.25rem | Section header, card title |
| Heading 3 (sub-section) | Inter | 600 (Semibold) | 16px / 1rem | Sub-section, label group |
| Body | Inter | 400 (Regular) | 14px / 0.875rem | Default body text |
| Body Small | Inter | 400 (Regular) | 12px / 0.75rem | Caption, meta info, timestamp |
| Label / Form | Inter | 500 (Medium) | 14px / 0.875rem | Form label, table header |
| Button | Inter | 600 (Semibold) | 14px / 0.875rem | Button text, CTA |

> **Font Stack:** `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif`
> Inter dipilih karena legibility tinggi di layar kecil (mobile driver) dan tersedia gratis via Google Fonts.

### 14.3 Spacing System

Menggunakan skala 4px base unit, konsisten dengan Tailwind CSS default:

| Token | Value | Penggunaan |
|---|---|---|
| `space-1` | 4px | Jarak antar inline element |
| `space-2` | 8px | Padding kecil, gap antar icon & text |
| `space-3` | 12px | Padding dalam form input |
| `space-4` | 16px | Padding card, jarak antar form field |
| `space-5` | 20px | Section margin internal |
| `space-6` | 24px | Jarak antar section |
| `space-8` | 32px | Page padding horizontal |

### 14.4 Border Radius

**No radius** — Seluruh elemen menggunakan sudut tajam (0px). Keputusan desain untuk konsistensi visual yang tegas sesuai brand Truckinc.

### 14.5 Shadow / Elevation

| Token | Value | Penggunaan |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Card default, input focus |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Dropdown, popover, elevated card |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modal, bottom sheet, floating button |

### 14.6 Component Styles

#### Buttons

| Variant | Background | Text | Border | Penggunaan |
|---|---|---|---|---|
| **Primary** | `--color-accent` (#E8731A) | White | none | CTA utama: "Kirim Laporan", "Export Excel" |
| **Secondary** | White | `--color-primary` | 1px `--color-gray-200` | Aksi sekunder: "Batal", "Lihat Riwayat" |
| **Danger** | `--color-danger` | White | none | Hapus data, aksi destruktif |
| **Ghost** | Transparent | `--color-gray-600` | none | Icon button, action minor |
| **Disabled** | `--color-gray-200` | `--color-gray-400` | none | Submit terkunci (GPS off) |

> Button height: **44px minimum** (mobile touch target sesuai WCAG). Padding horizontal: 16px–24px.

#### Form Input

| Property | Value |
|---|---|
| Height | 44px (mobile), 40px (desktop) |
| Background | White |
| Border | 1px solid `--color-gray-200` |
| Border (focus) | 2px solid `--color-accent` |
| Border (error) | 2px solid `--color-danger` |
| Border radius | `radius-sm` (6px) |
| Padding | 12px horizontal |
| Font | 14px, `--color-gray-900` |
| Placeholder | `--color-gray-400` |

#### Card (Laporan)

| Property | Driver App | Dashboard Admin |
|---|---|---|
| Background | White | White |
| Border | 1px solid `--color-gray-200` | 1px solid `--color-gray-200` |
| Border radius | `radius-lg` (12px) | `radius-md` (8px) |
| Padding | 16px | 16px–20px |
| Shadow | `shadow-sm` | `shadow-sm` |
| Badge Pickup | `--color-info` background | `--color-info` background |
| Badge Drop | `--color-success` background | `--color-success` background |
| Indikator baru | — | Left border 3px `--color-accent` |

#### Navigation

**PWA Driver (Bottom Navigation):**

| Property | Value |
|---|---|
| Height | 56px |
| Background | White |
| Border top | 1px solid `--color-gray-200` |
| Icon size | 24px |
| Icon (inactive) | `--color-gray-400` |
| Icon (active) | `--color-accent` |
| Label | 10px, medium weight |
| Items | Beranda, Buat Laporan, Riwayat, Profil |

**Dashboard Admin (Sidebar):**

| Property | Value |
|---|---|
| Width | 240px (desktop), collapsed 64px |
| Background | `--color-primary` (#0F1B2D) |
| Text | White, opacity 0.7 (inactive), 1.0 (active) |
| Active item | Background `--color-primary-600`, left border 3px `--color-accent` |
| Logo | Truckinc logo di top sidebar |

### 14.7 Iconography

| Property | Value |
|---|---|
| Library | Lucide Icons (open-source, MIT license) |
| Stroke width | 1.5px (default) |
| Size (mobile nav) | 24px |
| Size (inline/button) | 16px–20px |
| Color | Mengikuti warna teks kontainer |

Icon yang digunakan (referensi Lucide):
- **Buat Laporan:** `plus-circle`
- **Pickup:** `package-plus`
- **Drop:** `package-check`
- **GPS On:** `map-pin` (success)
- **GPS Off:** `map-pin-off` (danger)
- **Kamera:** `camera`
- **Riwayat:** `clock`
- **Filter:** `filter`
- **Export:** `download`
- **Peta:** `map`
- **Truck/Kendaraan:** `truck`
- **Driver/User:** `user`
- **Logout:** `log-out`

### 14.8 Responsive Breakpoints

| Token | Width | Target |
|---|---|---|
| `mobile` | 0 – 639px | PWA Driver (primary viewport) |
| `tablet` | 640px – 1023px | Dashboard admin mobile/tablet |
| `desktop` | 1024px+ | Dashboard admin primary viewport |

### 14.9 Status Colors & States (GPS)

Karena GPS enforcement adalah fitur krusial, berikut mapping visual yang konsisten:

| State | Color | Icon | UI Behavior |
|---|---|---|---|
| GPS Aktif + Akurasi baik (≤100m) | `--color-success` | `map-pin` + checkmark | Tampilkan nama lokasi, tombol submit enabled |
| GPS Aktif + Akurasi rendah (>100m) | `--color-warning` | `map-pin` + warning | Tampilkan warning banner, tombol submit tetap enabled |
| GPS Tidak Aktif / Ditolak | `--color-danger` | `map-pin-off` | Tampilkan error banner full-width, tombol submit disabled + grayed out |
| Sedang mendapatkan lokasi | `--color-info` | Loading spinner | Tampilkan "Mendapatkan lokasi..." |

### 14.10 Tailwind CSS Configuration

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Primary - Truckinc Deep Navy */
  --color-primary: #051E4B;
  --color-primary-600: #0A2E72;
  --color-primary-400: #1A4A9E;
  --color-primary-100: #E5ECF8;

  /* Accent - Truckinc Gold */
  --color-accent: #E2B746;
  --color-accent-600: #C9A33D;
  --color-accent-400: #ECC96B;
  --color-accent-100: #FBF3D9;

  /* Semantic */
  --color-success: #16A34A;
  --color-warning: #EAB308;
  --color-danger: #DC2626;
  --color-info: #2563EB;

  /* Font */
  --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
}
```

### 14.11 Design Principles

1. **Mobile-first, thumb-friendly** — Semua elemen interaktif minimal 44px touch target. Driver menggunakan app di perjalanan, sering dengan satu tangan.
2. **Minimal steps** — Maksimal 3 tap dari buka app sampai laporan terkirim. Kurangi input manual, perbanyak pre-fill dan auto-detect.
3. **Clear feedback** — Setiap aksi punya feedback visual yang jelas (success toast, loading state, error banner). Driver harus tahu apakah laporan sudah terkirim tanpa ragu.
4. **Brand consistency** — Warna dan tone mengikuti identitas Truckinc (navy + orange). App terasa sebagai bagian dari ekosistem perusahaan, bukan tool generik.
5. **Accessibility** — Contrast ratio minimal 4.5:1 untuk text. Semua warna semantic tidak hanya mengandalkan warna (ada icon/text pendukung).