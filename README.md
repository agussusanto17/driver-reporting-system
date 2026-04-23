# Driver Reporting System

Sistem Pelaporan & Monitoring Pengiriman Barang — menggantikan proses manual via WhatsApp.

## Stack

- **Next.js 14+** (App Router) — Fullstack framework
- **Prisma** — ORM + MySQL
- **NextAuth.js** — Authentication (JWT)
- **Tailwind CSS** — Styling
- **Leaflet + OpenStreetMap** — Peta (gratis)
- **SheetJS** — Export Excel
- **browser-image-compression** — Kompresi foto client-side

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env — isi DATABASE_URL dan NEXTAUTH_SECRET
```

### 3. Setup database

```bash
npm run db:push    # Push schema ke database
npm run db:seed    # Seed data awal (admin + driver + kendaraan)
```

### 4. Run development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### Default Accounts

| Role   | Username | Password   |
| ------ | -------- | ---------- |
| Admin  | admin    | admin123   |
| Driver | driver1  | driver123  |
| Driver | driver2  | driver123  |

## Project Structure

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

## Deployment (Shared Hosting)

1. Build: `npm run build`
2. Start: `npm run start`
3. Pastikan folder `/uploads/` persistent dan ter-backup
4. Estimasi disk: ~3.5GB/bulan (50 driver × 5 laporan/hari × 500KB)
