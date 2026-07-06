# Perpustakaan Backend API

Proyek ini adalah backend RESTful API untuk Sistem Informasi Perpustakaan, dikembangkan menggunakan Node.js, Express, TypeScript, dan Prisma ORM dengan arsitektur **Monorepo (pnpm workspace)**. 

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi:** Sistem login JWT dengan Role-Based Access Control (Admin, Petugas, Anggota).
- **Manajemen Akun:** Fitur khusus admin untuk manajemen akun (tambah, nonaktifkan (soft-delete), reset password).
- **Manajemen Katalog:** Pengelolaan data Buku, Penerbit, Pengarang, dan Klasifikasi dengan fitur pencarian multi-kolom dan pagination.
- **Manajemen Inventaris:** Pendataan fisik buku dan pelacakan ketersediaan.
- **Transaksi Peminjaman & Pengembalian:** Mencakup kalkulasi denda keterlambatan secara otomatis yang tidak mempengaruhi riwayat sebelumnya jika tarif diubah.
- **Dashboard:** Ringkasan statistik perpustakaan untuk Admin (lengkap) dan Petugas (sederhana).
- **Konfigurasi Sistem:** Pengaturan lama pinjam dan tarif denda (Zod validation).

---

## 🛠️ Persyaratan Sistem

Pastikan perangkat Anda sudah terinstal:
- **Node.js** (v18 atau lebih baru)
- **pnpm** (Package manager, disarankan v8 / v9+)
- **MySQL** (Database Server)

---

## 📦 Instalasi & Persiapan

### 1. Kloning Repositori & Instal Dependencies
Jalankan perintah ini di direktori akar proyek:
```bash
pnpm install
```

### 2. Pengaturan Variabel Lingkungan (.env)
Aplikasi ini membutuhkan file `.env`. Buat file `.env` di dalam folder `apps/server/` atau sesuaikan dengan setup yang Anda gunakan. Contoh isinya:

```env
DATABASE_URL="mysql://root:@localhost:3306/perpustakaan"
JWT_SECRET="rahasia_super_aman"
PORT=3000
CORS_ORIGIN="*"
```
*(Sesuaikan username, password, dan nama database pada string `DATABASE_URL`)*

### 3. Migrasi Database & Prisma
Proyek ini menggunakan Prisma. Anda harus melakukan sinkronisasi skema ke database dan meng-generate Prisma Client.

```bash
# Melakukan push/sinkronisasi skema Prisma ke database MySQL
pnpm run db:push 

# ATAU jika menggunakan fitur migration:
# pnpm run db:migrate

# Meng-generate ulang client TypeScript Prisma
pnpm run db:generate
```

### 4. Menjalankan Server
Untuk menjalankan server dalam mode pengembangan (development dengan hot-reload):
```bash
pnpm run dev
```
Server akan berjalan secara default di `http://localhost:3000`.

---

## 📚 Dokumentasi API Endpoint

Semua endpoint membutuhkan Header Authorization bertipe Bearer Token kecuali `/auth/login` dan `/auth/register`.  
Format header: `Authorization: Bearer <token_jwt>`

### 🔑 1. Autentikasi (`/auth`)

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| POST | `/auth/login` | Publik | Login untuk mendapatkan token JWT |
| POST | `/auth/register` | Publik | Mendaftarkan akun (default role: ANGGOTA) |

**Contoh Payload POST `/auth/login`:**
```json
{
  "username": "admin1",
  "password": "password123"
}
```

### 👤 2. Pengaturan User & Profil (`/users`)
*Semua endpoint `/users` (kecuali `/me`) hanya dapat diakses oleh **ADMIN**.*

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/users/me/profil` | Semua | Melihat data profil diri sendiri |
| PUT | `/users/me/profil` | Semua | Mengubah nama, email, dan kontak profil sendiri |
| PUT | `/users/me/password` | Semua | Mengganti password (butuh `password_lama`) |
| GET | `/users` | ADMIN | Mengambil daftar akun (bisa tambah query `?status_aktif=true`) |
| POST | `/users` | ADMIN | Membuat akun petugas/admin baru |
| PUT | `/users/:id` | ADMIN | Mengubah role atau username |
| PATCH | `/users/:id/nonaktifkan`| ADMIN | Soft-delete akun (Admin terakhir tidak bisa di-nonaktifkan) |
| PATCH | `/users/:id/reaktifkan` | ADMIN | Mengaktifkan akun kembali |
| PATCH | `/users/:id/reset-password`| ADMIN | Generate password acak baru (di-return 1 kali) |

**Contoh Payload PUT `/users/me/password`:**
```json
{
  "password_lama": "rahasia123",
  "password_baru": "baru321"
}
```

### 📖 3. Katalog Buku (`/buku`)

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/buku` | SEMUA | Pencarian katalog (mendukung pagination `?page=1&limit=20` & filter `judul`, `pengarang`, dll) |
| GET | `/buku/:id` | SEMUA | Detail spesifik buku |
| POST | `/buku` | ADMIN, PETUGAS | Menambah buku baru |
| PUT | `/buku/:id` | ADMIN, PETUGAS | Memperbarui data buku |
| DELETE| `/buku/:id` | ADMIN, PETUGAS | Menghapus buku |

**Contoh Payload POST `/buku`:**
```json
{
  "judul": "Belajar TypeScript",
  "kd_penerbit": 1,
  "kd_klasifikasi": 2,
  "kd_pengarang": 1,
  "thn_terbit": "2023",
  "bahasa": "Indonesia",
  "edisi": "Pertama",
  "ISBN": "978-602-xxx-x",
  "jumlah": "10"
}
```

### 🔁 4. Transaksi Pinjam & Denda (`/pinjam`)

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/pinjam` | ADMIN, PETUGAS | Melihat semua transaksi |
| GET | `/pinjam/anggota/:kd/histori`| SEMUA | Histori pinjam & total denda belum lunas milik Anggota |
| POST | `/pinjam` | ADMIN, PETUGAS | Membuat transaksi peminjaman (bisa pinjam > 1 inventaris) |
| POST | `/pinjam/kembali` | ADMIN, PETUGAS | Mengembalikan item & hitung denda jika telat |
| PATCH | `/pinjam/:no_pinjam/denda/:no_inventaris/lunas`| ADMIN, PETUGAS | Melunasi tagihan denda |

**Contoh Payload POST `/pinjam`:**
```json
{
  "kd_anggota": 15,
  "kd_petugas": 2,
  "no_inventaris_list": [101, 102]
}
```
**Contoh Payload POST `/pinjam/kembali`:**
```json
{
  "no_pinjam": 10,
  "no_inventaris": 101
}
```

### 📊 5. Dashboard (`/dashboard`)

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/dashboard/ringkasan` | ADMIN, PETUGAS | Ringkasan singkat: jumlah buku, dipinjam, terlambat, dll |
| GET | `/dashboard/admin` | ADMIN | Info komprehensif: komparasi data bulan lalu, pendapatan denda, top buku populer |

### ⚙️ 6. Konfigurasi Sistem (`/konfigurasi`)

| Method | Endpoint | Role | Fungsi |
|---|---|---|---|
| GET | `/konfigurasi` | ADMIN | Melihat setelan lama pinjam & tarif denda |
| PUT | `/konfigurasi` | ADMIN | Mengubah setelan aplikasi (berlaku untuk transaksi masa depan) |

**Contoh Payload PUT `/konfigurasi`:**
```json
{
  "lama_pinjam": 7,
  "tarif_denda": 2000
}
```
*(Catatan: tipe data harus Integer positif, divalidasi oleh Zod)*

---

### Referensi Tabel Master (Penerbit, Pengarang, Klasifikasi, Inventaris)
Terdapat endpoint standar (GET, POST, PUT, DELETE) untuk rute:
- `/penerbit`
- `/pengarang`
- `/klasifikasi`
- `/inventaris`

Semuanya dibatasi untuk role **ADMIN** dan **PETUGAS**.
