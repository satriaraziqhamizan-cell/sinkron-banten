# SINKRON Banten — Sistem Integrasi Kebutuhan Industri dan Kompetensi Vokasi Provinsi Banten

Aplikasi web terintegrasi untuk menyelaraskan kurikulum satuan pendidikan menengah kejuruan (SMK), sinyal kebutuhan industri kawasan ekonomi Banten, dan pelacakan lulusan 6 bulan (Tracer Study).

---

## 1. Arsitektur & Teknologi

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4 + Lucide Icons + PWA (Service Worker & Web App Manifest).
- **Backend**: Node.js Express + TSX (Full-Stack server mounted on port 3000).
- **Keamanan Data**: Kepatuhan UU No. 27/2022 tentang Pelindungan Data Pribadi (UU PDP), sanitasi input (Zod), Small-Cell Suppression (n < 10) di sisi server, dan Audit Log permanen (append-only).
- **AI Bertanggung Jawab**: Model Gemini via `@google/genai` (hanya dipanggil dari sisi server, tanpa mengirim data pribadi alumni) dengan tingkat keyakinan (confidence score) dan bukti komparatif.

---

## 2. Cara Menjalankan Aplikasi di Lingkungan Pengembangan (Local Dev)

1. **Instal dependensi**:
   ```bash
   npm install
   ```

2. **Salin berkas konfigurasi lingkungan**:
   ```bash
   cp .env.example .env
   ```

3. **Jalankan server pengembangan (Full-stack Express + Vite)**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## 3. Mode Demo vs Produksi

### Cara Mengaktifkan Mode Demo
Aplikasi mendukung **Mode Demo untuk Juri / Evaluator** yang mempermudah evaluasi 9 peran tanpa mengetik kredensial secara manual:
1. Di file `.env`, atur:
   ```env
   DEMO_MODE=true
   VITE_DEMO_MODE=true
   ```
2. Saat mode demo aktif:
   - Banner kuning **"MODE DEMO — data contoh untuk penjurian. Bukan data resmi."** akan tampil di bagian atas seluruh halaman.
   - Tombol dan navigasi **"Demo untuk Juri"** (`/demo`) akan muncul di Header dan Footer.
   - Endpoint backend `POST /api/demo/login` aktif melayani proses masuk 1-klik yang aman untuk 9 peran (Super Admin, Disdik, Disnaker, Bappeda, Sekolah/BKK, Industri/HRD, Alumni, Akademisi, Koordinator).
   - "Panduan Penjurian 5 Menit" tersedia di `/demo` untuk menguji alur data terpadu antarpemangku kepentingan.

### Peringatan Kritis Menjelang Rilis Produksi (Go-Live)
Sebelum meluncurkan aplikasi ke lingkungan produksi resmi Pemerintah Provinsi Banten:
1. **Matikan Mode Demo**:
   Pastikan variabel lingkungan disetel ke `false`:
   ```env
   DEMO_MODE=false
   VITE_DEMO_MODE=false
   ```
   Bila `DEMO_MODE=false`, rute `/demo` dan endpoint `POST /api/demo/login` secara otomatis tidak aktif (404 Not Found) dan tidak dapat diakses publik.
2. **Ganti Akun & Kredensial Bawaan di `server/db.ts`**:
   Akun contoh dan kata sandi bawaan (seperti `admin@bantenprov.go.id`, `disdik@bantenprov.go.id`, dll.) hanya ditujukan untuk evaluasi dan demonstrasi. Seluruh akun administrator dan institusi wajib direset, diverifikasi ulang secara legal, dan diganti dengan kata sandi kuat serta email kedinasan resmi (`@bantenprov.go.id` / instansi resmi).
3. **Catatan Siklus Penyimpanan `db.json` di Cloud Run**:
   Penyimpanan file lokal `data/db.json` pada container Google Cloud Run bersifat **ephemeral (stateless)**:
   - Setiap kali container dibuat ulang (*cold start*, revisi deploy baru, atau penskalaan horizontal), sistem berkas container akan kembali ke citra awal, sehingga berkas `data/db.json` dapat ter-reset kembali ke data seed awal.
   - Untuk lingkungan produksi skala penuh jangka panjang, hubungkan backend Express ke basis data persisten terkelola seperti **Google Cloud SQL (PostgreSQL)** atau **Firebase Firestore**.

---

## 4. Deploy ke Google Cloud Run

Aplikasi SINKRON Banten telah dikemas dengan `Dockerfile` multi-stage berbasis `node:20-alpine` yang siap di-deploy langsung ke Cloud Run.

### A. Langkah Build & Deploy
1. **Build container image via Cloud Build / Artifact Registry**:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/sinkron-banten:latest
   ```

2. **Deploy ke Cloud Run dengan Variabel Wajib**:
   ```bash
   gcloud run deploy sinkron-banten \
     --image gcr.io/PROJECT_ID/sinkron-banten:latest \
     --platform managed \
     --region asia-east1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,PORT=3000,DEMO_MODE=false,VITE_DEMO_MODE=false,APP_URL=https://sinkron.bantenprov.go.id,VITE_PUBLIC_URL=https://sinkron.bantenprov.go.id \
     --set-secrets GEMINI_API_KEY=sinkron-gemini-key:latest
   ```

### B. Variabel Lingkungan Produksi (Wajib)
| Variabel | Keterangan & Nilai Produksi |
|---|---|
| `GEMINI_API_KEY` | Kunci API Google Gemini untuk analisis keselarasan vokasi (disimpan aman di Secret Manager). |
| `APP_URL` | Domain publik resmi web app (mis. `https://sinkron.bantenprov.go.id`). |
| `VITE_PUBLIC_URL` | Domain publik untuk banner OpenGraph & Twitter Cards. |
| `DEMO_MODE` | **WAJIB `false`** untuk mematikan bypass login, panel simulasi demo, dan endpoint reset data. |
| `VITE_DEMO_MODE` | **WAJIB `false`** untuk menyembunyikan tombol demo pada antarmuka pengguna. |
| `NODE_ENV` | `production`. |
| `PORT` | Diinjeksi otomatis oleh Cloud Run (bawaan `3000`). |

---

## 5. Checklist Sebelum Rilis Publik

Sebelum domain publik resmi dibuka untuk masyarakat dan institusi Provinsi Banten:

- [ ] **Nonaktifkan Mode Demo**: Pastikan `DEMO_MODE=false` dan `VITE_DEMO_MODE=false` pada environment Cloud Run/server produksi.
- [ ] **Ganti Seluruh Kata Sandi Akun Seed**: Reset kata sandi awal seluruh akun contoh (`admin@bantenprov.go.id`, `disdik@bantenprov.go.id`, dll.) dengan kombinasi sandi kuat dan unik.
- [ ] **Konfigurasi Kunci API Gemini**: Pastikan `GEMINI_API_KEY` aktif dan memiliki kuota yang memadai di Google Cloud Console.
- [ ] **Pengesahan Kebijakan Privasi & Syarat Layanan**: Pastikan klausul UU PDP No. 27/2022 telah ditelaah dan disahkan oleh Biro Hukum Setda Banten.
- [ ] **Konfigurasi Domain & Sertifikat SSL**: Hubungkan domain resmi `sinkron.bantenprov.go.id` dengan DNS Cloudflare / Cloud DNS dan pastikan sertifikat HTTPS aktif (diperlukan untuk Service Worker PWA).
- [ ] **Pemberitahuan kepada DPO (Data Protection Officer)**: Laporkan penempatan sistem kepada pejabat pengelola data pribadi Pemprov Banten.

---

## 6. Akun Uji Coba Terverifikasi (Demo Mode)

| Peran | Email | Kata Sandi | Keterangan |
|---|---|---|---|
| **Super Admin** | `admin@bantenprov.go.id` | `AdminS1nkron#2026` | Verifikasi institusi, konfigurasi periode, audit log |
| **Dinas Pendidikan** | `disdik@bantenprov.go.id` | `DisdikBanten#2026` | Peta kecocokan, rapor sekolah, persetujuan rekomendasi |
| **Dinas Tenaga Kerja** | `disnaker@bantenprov.go.id` | `DisnakerBanten#2026` | Verifikasi sinyal industri, pelatihan BLK |
| **Admin SMK (BKK)** | `bkk.smkn1cilegon@sch.id` | `Smkn1Cilegon#2026` | Kurikulum, impor alumni CSV, kirim link pelacak |
| **HRD Industri** | `recruitment@krakatausteel.com` | `KrakatauSteel#2026` | Pengisian sinyal kompetensi, lowongan & magang |
| **Alumni SMK** | `rizky.pratama@gmail.com` | `AlumniBanten#2026` | Survei pelacak 6 bulan, profil privasi saya |

---

## 7. Aset Merek & Identitas Visual

Logo resmi SINKRON Banten disimpan dan di-generate dalam struktur aset sebagai berikut:

| Berkas | Lokasi | Dimensi / Format | Penggunaan & Penempatan |
|---|---|---|---|
| **Master Logo** | `public/brand/logo-original.png` | 1254x1254 PNG | File master arsip resmi. Tidak dimuat langsung oleh tag `<img>` di UI untuk efisiensi transfer data. |
| **Logo Mark (Emblem)** | `public/brand/logo-mark-128.png`, `logo-mark-256.png` (+ `.webp`) | 128x128 & 256x256 PNG/WebP | Lambang lingkaran panah & jembatan dengan latar transparan. Digunakan pada Header, Footer, AuthPage, DemoPage, dan layar pemuatan awal (`App.tsx`) dengan `srcset 1x/2x`. |
| **Logo Penuh** | `public/brand/logo-full-256.png`, `logo-full-512.png` (+ `.webp`) | 256x256 & 512x512 PNG/WebP | Lambang lengkap beserta teks "SINKRON BANTEN". Digunakan untuk dokumen resmi, unduhan, dan pratinjau. |
| **Ikon PWA (Any)** | `public/icons/icon-192.png`, `icon-512.png` | 192x192 & 512x512 PNG | Ikon instalasi Progressive Web App berbasis lambang logo-mark jernih tanpa teks kecil. |
| **Ikon Maskable** | `public/icons/icon-maskable-512.png` | 512x512 PNG | Ikon PWA adaptif dengan margin aman 20% sesuai standar Android adaptive icon. |
| **Apple Touch Icon** | `public/apple-touch-icon.png` | 180x180 PNG | Ikon pintasan Safari & iOS Home Screen. |
| **Favicon** | `public/favicon.ico` & `favicon.png` | 48x48 Multi/PNG | Ikon tab browser dan bookmark bar berbasis lambang logo-mark. |
| **OpenGraph Image** | `public/og-image.png` | 1200x630 PNG | Kartu pratinjau media sosial (WhatsApp, Twitter, LinkedIn, Facebook) berlatar warna tema resmi `#133E6E`. Mendukung domain absolut melalui variabel `VITE_PUBLIC_URL` atau fallback ke `/og-image.png`. |

Skrip pembuatan aset dan ikon otomatis tersedia di `scripts/generate-icons.ts` (menggunakan paket `sharp`):
```bash
npx tsx scripts/generate-icons.ts
```
