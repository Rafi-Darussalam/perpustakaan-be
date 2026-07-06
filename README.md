# 📚 Sistem Informasi Perpustakaan Backend (API)

Backend RESTful API untuk Sistem Informasi Perpustakaan. Dibangun dengan fokus pada kecepatan, keamanan, dan skalabilitas menggunakan ekosistem modern Node.js.

## 🌟 Daftar Isi
- [Arsitektur & Teknologi](#arsitektur--teknologi)
- [Struktur Direktori (Monorepo)](#struktur-direktori-monorepo)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Panduan Instalasi & Setup Database](#panduan-instalasi--setup-database)
- [Daftar Perintah (Scripts)](#daftar-perintah-scripts)
- [Dokumentasi API Lengkap](#dokumentasi-api-lengkap)
  - [1. Autentikasi (Auth)](#1-autentikasi-auth)
  - [2. Manajemen Akun (Users)](#2-manajemen-akun-users)
  - [3. Katalog (Buku, Pengarang, Penerbit, Klasifikasi)](#3-katalog-buku-pengarang-penerbit-klasifikasi)
  - [4. Inventaris](#4-inventaris)
  - [5. Transaksi (Pinjam & Denda)](#5-transaksi-pinjam--denda)
  - [6. Dashboard](#6-dashboard)
  - [7. Konfigurasi Sistem](#7-konfigurasi-sistem)

---

## 🏗️ Arsitektur & Teknologi

Sistem ini menggunakan pendekatan **Monorepo** untuk memisahkan logika aplikasi (server) dengan logika database (ORM) demi kebersihan kode.
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (dengan TypeScript)
- **Database:** MySQL
- **ORM:** Prisma
- **Validasi:** Zod
- **Keamanan:** JWT (JSON Web Token), bcryptjs (Hash Password), CORS
- **Package Manager:** pnpm (workspace)

---

## 📂 Struktur Direktori (Monorepo)

```text
perpustakaan-be/
├── apps/
│   └── server/          # Aplikasi Express backend utama
│       ├── src/
│       │   ├── controllers/ # Logika bisnis (request & response)
│       │   ├── middlewares/ # Guard role, auth JWT
│       │   ├── routes/      # Definisi endpoint (router)
│       │   └── index.ts     # Entry point server
│       └── .env         # Environment variable aplikasi
├── packages/
│   ├── config/          # Konfigurasi ESLint & Prettier
│   ├── db/              # Prisma schema & generated client
│   │   ├── prisma/      # Schema MySQL
│   │   └── src/         # Export Prisma Client
│   └── env/             # Validasi tipe & schema .env (Zod)
└── package.json         # Konfigurasi workspace pnpm
```

---

## 💻 Persyaratan Sistem

1. **Node.js**: Versi 18.x atau lebih baru.
2. **pnpm**: Sangat disarankan untuk pengelolaan monorepo. (Install via `npm install -g pnpm`).
3. **MySQL Database**: Berjalan di lokal (XAMPP/MAMP/Native) atau Docker.

---

## 🛠️ Panduan Instalasi & Setup Database

### Langkah 1: Kloning Repositori & Instalasi
Buka terminal dan jalankan:
```bash
# Clone proyek (sesuaikan URL)
git clone <url-repo>

# Pindah ke folder proyek
cd perpustakaan-be

# Instal semua dependencies di seluruh workspace
pnpm install
```

### Langkah 2: Persiapan Database MySQL
1. Buka MySQL Anda (lewat phpMyAdmin, DBeaver, atau CLI).
2. Buat database kosong bernama `perpustakaan` (atau nama lain yang Anda suka).

### Langkah 3: Setup Variabel Lingkungan (.env)
Aplikasi ini membaca konfigurasi dari folder `apps/server/.env`. Buat file tersebut dan isi:

```env
# URL koneksi database Prisma (mysql://USER:PASSWORD@HOST:PORT/NAMA_DATABASE)
DATABASE_URL="mysql://root:@localhost:3306/perpustakaan"

# Secret key untuk menandatangani JWT (ganti dengan string acak yang aman)
JWT_SECRET="KunciRahasiaSuperAman123!@#"

# Port server berjalan
PORT=3000

# Konfigurasi CORS
CORS_ORIGIN="*"
```

### Langkah 4: Migrasi & Generate Prisma
Sinkronisasi struktur database dan buat *client* TypeScript:
```bash
# Mensinkronisasikan schema ke database fisik
pnpm run db:push

# Meng-generate Prisma Client ke node_modules/@perpustakaan-be/db
pnpm run db:generate
```

---

## 📜 Daftar Perintah (Scripts)

Perintah ini dapat dijalankan dari folder _root_ proyek:

- `pnpm run dev` : Menjalankan server dalam mode pengembangan (dengan *hot-reload*).
- `pnpm run build` : Melakukan kompilasi TypeScript ke JavaScript (production).
- `pnpm run check-types` : Memeriksa tipe TypeScript tanpa melakukan *build*.
- `pnpm run db:push` : Mengupdate database MySQL agar sesuai dengan file `schema.prisma`.
- `pnpm run db:generate` : Memperbarui Prisma Client.
- `pnpm run db:studio` : Membuka GUI Prisma di browser untuk mengelola isi database secara visual.

---

## 🌐 Dokumentasi API Lengkap

### Format Otorisasi Header
Sebagian besar endpoint memerlukan token yang dikirim via _Headers_:
```
Authorization: Bearer <TOKEN_JWT_DARI_LOGIN>
```
Response gagal otorisasi selalu berbentuk:
```json
{ "message": "Unauthorized: Missing token" } // 401
{ "message": "Forbidden: Insufficient permissions" } // 403
```

---

### 1. Autentikasi (Auth)
_Endpoint publik, tidak memerlukan header authorization._

#### 🔹 Login
- **Endpoint:** `POST /auth/login`
- **Body JSON:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response Berhasil (200 OK):**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUz...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  }
  ```
*(Catatan: Akun dengan status dinonaktifkan akan mendapatkan error `401: Akun dinonaktifkan`)*

#### 🔹 Register
- **Endpoint:** `POST /auth/register`
- **Fungsi:** Membuat akun baru. Secara default role yang diberikan adalah `ANGGOTA`.
- **Body JSON:** `username` dan `password`
- **Response Berhasil (201 Created):** Data user baru.

---

### 2. Manajemen Akun (Users)

#### 🔹 Profil Diri Sendiri (Role: Semua)
- **GET `/users/me/profil`**: Mendapatkan detail profil diri sendiri (nama, email, kontak).
- **PUT `/users/me/profil`**: Memperbarui profil.
  ```json
  { "nama": "John Doe", "email": "john@mail.com", "kontak": "0812345" }
  ```
- **PUT `/users/me/password`**: Mengganti password.
  ```json
  { "password_lama": "rahasia123", "password_baru": "baru123" }
  ```

#### 🔹 Kelola Oleh Admin (Role: ADMIN)
- **GET `/users`**: Daftar akun. Opsional *query param*: `?status_aktif=true` atau `false`.
- **POST `/users`**: Membuat akun baru dengan role (`ADMIN`, `PETUGAS`, `ANGGOTA`).
- **PUT `/users/:id`**: Mengubah `username` atau `role` dari user lain.
- **PATCH `/users/:id/nonaktifkan`**: Melakukan _soft-delete_. 
  *(Guard: Tidak bisa menonaktifkan akun jika itu adalah satu-satunya ADMIN yang tersisa di sistem).*
- **PATCH `/users/:id/reaktifkan`**: Mengembalikan akun yang nonaktif.
- **PATCH `/users/:id/reset-password`**: Mereset password pengguna secara acak.
  - **Response Berhasil (200 OK):**
    ```json
    {
      "message": "Password berhasil direset",
      "password_baru": "XyZ123!@#aBc"
    }
    ```

---

### 3. Katalog (Buku, Pengarang, Penerbit, Klasifikasi)

Semua resource (Pengarang, Penerbit, Klasifikasi) memiliki metode _CRUD_ standar:
- `GET /` (Role: Semua)
- `GET /:id` (Role: Semua)
- `POST /`, `PUT /:id`, `DELETE /:id` (Role: ADMIN & PETUGAS)

#### 🔹 Pencarian Buku
- **Endpoint:** `GET /buku`
- **Role:** ADMIN, PETUGAS, ANGGOTA
- **Query Parameter:**
  - `page` (default 1)
  - `limit` (default 20, max 100)
  - `judul` (filter contains judul)
  - `pengarang` (filter contains nama pengarang)
  - `penerbit` (filter contains nama penerbit)
  - `klasifikasi` (filter contains nama klasifikasi)
- **Response Berhasil (200 OK):**
  ```json
  {
    "data": [
      {
        "kd_buku": 1,
        "judul": "Algoritma Pemrograman",
        "penerbit": { "nm_penerbit": "Informatika" },
        "pengarang": { "nm_pengarang": "Rinaldi" },
        "klasifikasi": { "nm_klasifikasi": "Teknologi" }
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
  ```

---

### 4. Inventaris
Digunakan untuk mendata jumlah/fisik spesifik buku beserta statusnya (`tersedia`, `dipinjam`, dll).
- `GET /inventaris` & `GET /inventaris/:id`
- `POST /inventaris`
  ```json
  {
    "kd_buku": 1,
    "no_buku": "B001",
    "tgl_masuk": "2024-01-01",
    "status_buku": "tersedia"
  }
  ```
- `PUT /inventaris/:id` & `DELETE /inventaris/:id`

---

### 5. Transaksi (Pinjam & Denda)

#### 🔹 Histori Anggota
- **Endpoint:** `GET /pinjam/anggota/:kd_anggota/histori`
- **Role:** ADMIN, PETUGAS, ANGGOTA
- **Fungsi:** Mengembalikan semua riwayat peminjaman beserta detail buku dan total denda yang _belum lunas_ milik anggota tersebut.

#### 🔹 Buat Transaksi Pinjam
- **Endpoint:** `POST /pinjam`
- **Role:** ADMIN, PETUGAS
- **Body JSON:**
  ```json
  {
    "kd_anggota": 10,
    "kd_petugas": 2,
    "no_inventaris_list": [101, 102] 
  }
  ```
  *(Catatan: Bisa meminjam banyak buku sekaligus. `no_inventaris` harus berstatus 'tersedia')*

#### 🔹 Pengembalian Buku
- **Endpoint:** `POST /pinjam/kembali`
- **Role:** ADMIN, PETUGAS
- **Body JSON:**
  ```json
  {
    "no_pinjam": 5,
    "no_inventaris": 101
  }
  ```
- **Response Berhasil (200 OK):** Menghitung keterlambatan otomatis. Jika telat, record Denda akan otomatis terbuat.
  ```json
  {
    "message": "Pengembalian berhasil diproses",
    "terlambat": true,
    "hari_terlambat": 2,
    "denda": {
      "no_pinjam": 5,
      "no_inventaris": 101,
      "jmlh_denda": "4000",
      "lunas": false
    }
  }
  ```

#### 🔹 Pelunasan Denda
- **Endpoint:** `PATCH /pinjam/:no_pinjam/denda/:no_inventaris/lunas`
- **Role:** ADMIN, PETUGAS
- Mengubah flag `lunas` pada denda menjadi `true`.

---

### 6. Dashboard
Berisi ringkasan statistik yang dijalankan secara _parallel query_ untuk performa optimal.

#### 🔹 Ringkasan Petugas
- **Endpoint:** `GET /dashboard/ringkasan`
- **Role:** ADMIN, PETUGAS
- Mengembalikan: `total_buku`, `total_inventaris`, `total_anggota`, `sedang_dipinjam`, `terlambat`, `denda_belum_lunas`.

#### 🔹 Dashboard Admin
- **Endpoint:** `GET /dashboard/admin`
- **Role:** ADMIN
- Mengembalikan semua data Petugas, ditambah:
  - `total_nilai_denda_belum_lunas` (Rupiah)
  - `statistik_bulan_ini` (Buku baru, Pinjam Baru, Pendapatan Denda vs bulan lalu)
  - `buku_terpopuler` (Top 5 buku berdasarkan transaksi peminjaman)

---

### 7. Konfigurasi Sistem
- **Endpoint:** `GET /konfigurasi` & `PUT /konfigurasi`
- **Role:** ADMIN
- **Fungsi:** Mengatur kebijakan denda dan limit pinjam (diverifikasi via Zod).
- **Body JSON:**
  ```json
  {
    "lama_pinjam": 7,
    "tarif_denda": 2000
  }
  ```
  *(Catatan: tipe data harus Integer positif. Transaksi lama tidak akan terpengaruh jika tarif diperbarui).*
