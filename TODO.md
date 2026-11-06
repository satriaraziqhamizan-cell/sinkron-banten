# SINKRON Banten — Catatan Keterbatasan & Rencana Lanjutan (TODO.md)

Dokumen ini mencatat secara transparan keterbatasan teknis saat ini, fitur yang belum diimplementasikan secara penuh, serta prasyarat non-teknis agar aplikasi siap dipakai publik secara legal.

---

## 1. Keterbatasan Teknis Saat Ini (Jujur & Transparan)

| Aspek Teknis | Status Saat Ini | Kebutuhan & Rencana Produksi Skala Penuh |
|---|---|---|
| **Verifikasi Email Pengguna** | Belum Ada | Pengiriman tautan konfirmasi email saat registrasi akun baru belum aktif; pendaftaran institusi saat ini mengandalkan peninjauan manual oleh Administrator di Admin Console. |
| **Pemulihan Sandi (Lupa Sandi) via Email** | Dicatat di Audit Log | Endpoint `POST /api/auth/forgot` hanya mencatat permohonan ke audit log (hash email & IP) tanpa mengirim email nyata. Reset sandi manual ditangani oleh Super Admin. Diperlukan integrasi SMTP / transactional email API (SendGrid / Mailgun). |
| **Autentikasi Dua Faktor (2FA / TOTP)** | Penanda Skema Pengguna (Dalam Pengembangan) | Belum ada pemindaian QR code authenticator app (`speakeasy` / `otplib`) maupun validasi token 6 digit TOTP secara nyata. |
| **Penyimpanan Basis Data** | Berbasis Berkas JSON (`data/db.json`) | Penyimpanan data saat ini menggunakan berkas `data/db.json` dengan sinkronisasi persistensi server. Untuk beban produksi tinggi (multi-instance), wajib dimigrasikan ke Google Cloud SQL (PostgreSQL) atau Firebase Firestore. |
| **Penyimpanan Token Sesi di Klien** | `localStorage` + Header Bearer | Token sesi disimpan di `localStorage` klien dan diverifikasi dengan basis data sesi server (token ter-hash SHA-256). Rencana produksi jangka panjang: migrasi ke Cookie `HttpOnly; Secure; SameSite=Strict` disertai proteksi CSRF. |
| **Kebijakan Keamanan Konten (CSP)** | Mengizinkan `'unsafe-inline'` | Header CSP saat ini mengizinkan `'unsafe-inline'` untuk injeksi style Tailwind dan Google Fonts. Rencana produksi: adopsi nonces atau SHA hashes untuk seluruh skrip/style inline. |
| **WhatsApp Business API Resmi** | Tampilan UI & Simulasi Tautan | Pengiriman survei tracer via WhatsApp masih menggunakan format tautan browser (`https://wa.me/...`). Integrasi WhatsApp Business Platform resmi memerlukan verifikasi BSP (Meta Business Solution Provider) dan templat HSM berbayar. |

---

## 2. Prasyarat Non-Teknis & Hukum Sebelum Go-Live Publik

1. **Surat Keputusan (SK) Tim Koordinasi Daerah Vokasi (TKDV)**:
   - Penetapan sekretariat pengelola, pejabat penanggung jawab data (DPO), dan jadwal siklus sinkronisasi semesteran.
2. **Kepatuhan UU PDP No. 27/2022**:
   - Penunjukan Data Protection Officer (DPO) resmi di lingkungan Pemerintah Provinsi Banten.
   - Peninjauan klausul Syarat & Ketentuan serta Kebijakan Privasi oleh Biro Hukum Sekretariat Daerah Provinsi Banten.
   - SOP penanganan insiden kebocoran data dengan batas waktu pelaporan 3x24 jam ke lembaga pengawas data pribadi.
3. **Penyelarasan Spektrum Keahlian SMK**:
   - Pemutakhiran kode program keahlian SMK mengacu pada Spektrum Keahlian Vokasi terbaru dari Kemendikdasmen RI.
4. **Perjanjian Kerjasama (MoU) Kawasan Industri**:
   - Kesepakatan bersama KADIN Banten & APINDO Banten agar HRD industri secara rutin mengisi Sinyal Kebutuhan Tenaga Kerja setiap awal semester.
