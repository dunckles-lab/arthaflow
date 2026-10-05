# ArthaFlow &bull; Enterprise & Household Financial Management OS

ArthaFlow adalah platform manajemen keuangan multi-scope full-stack modern yang dibangun dengan Next.js 15 (App Router), TypeScript, Tailwind CSS, dan Supabase PostgreSQL. Dirancang untuk pencatatan keuangan pribadi, rumah tangga, hingga organisasi bisnis dengan sistem Role-Based Access Control (RBAC) granular dan dukungan Progressive Web App (PWA).

---

## Fitur Utama

- **Multi-Scope Isolation:** Dukungan scope *Personal*, *Household*, dan *Organization*.
- **Role-Based Access Control (RBAC):** Tingkatan peran `Superadmin`, `Admin`, dan `User` dengan pengaturan visibilitas item keuangan (rekening, tabungan, mutasi).
- **Google SSO & Auth Gate:** Autentikasi aman melalui Supabase Auth dengan perlindungan akses bagi pengguna anonim.
- **Manajemen Sumber Dana (CRUD Rekening):** Bank transfer, e-wallet, kas tunai, dan investasi dilengkapi palet warna kustom heksadesimal.
- **Manajemen Tabungan & Target Impian:** Alokasi pos dana, persentase progres target, aksi *Setor* dan *Tarik* tabungan, serta kontrol visibilitas per target tabungan.
- **Kategori Anggaran Granular:** Manajemen pos pemasukan & pengeluaran dengan batas anggaran bulanan (*budget limit*) dan color picker.
- **Input Nominal Cerdas:** Auto-formatting ribuan rupiah, badge satuan ringkas (`Juta`, `Miliar`, `Ribu`), pembacaan ejaan terbilang Bahasa Indonesia otomatis, dan shortcut penambahan cepat.
- **Laporan & Ekspor Data:** Ekspor mutasi transaksi terfilter ke format spreadsheet Microsoft Excel (`.xlsx`) dan dokumen PDF berformat tabel rapi.
- **PWA & Mobile-First Bottom-Sheet:** Adaptif terhadap safe-area perangkat iOS/Android dengan navigasi ergonomis.

---

## Prasyarat

- [Node.js](https://nodejs.org/) versi 18.18.0 atau yang lebih baru.
- Akun proyek [Supabase](https://supabase.com/) (PostgreSQL).

---

## Konfigurasi Environment Variables

1. Duplikasi file template `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Isi variabel berikut sesuai kredensial proyek Supabase Anda:
   ```env
   # Supabase Project URL (Dashboard -> Project Settings -> API)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

   # Supabase Anon Public API Key (Dashboard -> Project Settings -> API)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

---

## Inisialisasi Database (Supabase SQL)

Jalankan script DDL skema database yang tersedia di file `src/lib/schema.sql` pada **SQL Editor** di dashboard Supabase Anda untuk membuat tabel:
- `tenants` & `users` (RBAC & multi-tenancy)
- `wallets` (Rekening & sumber dana)
- `categories` (Kategori mutasi & batas anggaran)
- `savings_goals` (Target tabungan)
- `transactions` (Mutasi pemasukan, pengeluaran, transfer)
- `visibility_rules` (Aturan visibilitas per akun/user)
- `audit_logs` (Pencatatan aktivitas sistem)

---

## Menjalankan Proyek Secara Lokal

1. Pasang dependensi proyek:
   ```bash
   npm install
   ```

2. Jalankan server development lokal:
   ```bash
   npm run dev
   ```

3. Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## Build & Production Deployment

Untuk menguji build produksi:
```bash
npm run build
npm run start
```

Deploy instan ke Vercel:
```bash
vercel --prod
```
*Pastikan menambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di menu **Environment Variables** pada dashboard proyek Vercel Anda.*
