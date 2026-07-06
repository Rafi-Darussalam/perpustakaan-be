-- CreateTable
CREATE TABLE `PENERBIT` (
    `kd_penerbit` INTEGER NOT NULL AUTO_INCREMENT,
    `nm_penerbit` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`kd_penerbit`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PENGARANG` (
    `kd_pengarang` INTEGER NOT NULL AUTO_INCREMENT,
    `nm_pengarang` VARCHAR(191) NOT NULL,
    `jenis_kelamin` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`kd_pengarang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KLASIFIKASI` (
    `kd_klasifikasi` INTEGER NOT NULL AUTO_INCREMENT,
    `nm_klasifikasi` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`kd_klasifikasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BUKU` (
    `kd_buku` INTEGER NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `kd_penerbit` INTEGER NOT NULL,
    `kd_klasifikasi` INTEGER NOT NULL,
    `thn_terbit` VARCHAR(191) NOT NULL,
    `bahasa` VARCHAR(191) NOT NULL,
    `edisi` VARCHAR(191) NOT NULL,
    `ISBN` VARCHAR(191) NOT NULL,
    `jumlah` VARCHAR(191) NOT NULL,
    `kd_pengarang` INTEGER NOT NULL,

    PRIMARY KEY (`kd_buku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ANGGOTA` (
    `kd_anggota` INTEGER NOT NULL AUTO_INCREMENT,
    `nm_anggota` VARCHAR(191) NOT NULL,
    `jenis_kelamin` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `no_telp` VARCHAR(191) NOT NULL,
    `tgl_daftar` DATETIME(3) NOT NULL,

    PRIMARY KEY (`kd_anggota`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PETUGAS` (
    `kd_petugas` INTEGER NOT NULL AUTO_INCREMENT,
    `nm_petugas` VARCHAR(191) NOT NULL,
    `jenis_kelamin` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `pass` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`kd_petugas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `INVENTARIS` (
    `no_inventaris` INTEGER NOT NULL AUTO_INCREMENT,
    `kd_buku` INTEGER NOT NULL,
    `no_buku` VARCHAR(191) NOT NULL,
    `tgl_masuk` VARCHAR(191) NOT NULL,
    `status_buku` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`no_inventaris`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PINJAM` (
    `no_pinjam` INTEGER NOT NULL AUTO_INCREMENT,
    `kd_anggota` INTEGER NOT NULL,
    `tgl_pinjam` DATETIME(3) NOT NULL,
    `tgl_harus_kembali` DATETIME(3) NOT NULL,
    `kd_petugas` INTEGER NOT NULL,

    PRIMARY KEY (`no_pinjam`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DETPINJAM` (
    `no_pinjam` INTEGER NOT NULL,
    `no_inventaris` INTEGER NOT NULL,
    `tgl_pinjam` DATETIME(3) NOT NULL,
    `status_pinjam` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`no_pinjam`, `no_inventaris`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DENDA` (
    `no_pinjam` INTEGER NOT NULL,
    `no_inventaris` INTEGER NOT NULL,
    `tgl_denda` DATETIME(3) NOT NULL,
    `jmlh_denda` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`no_pinjam`, `no_inventaris`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BUKU` ADD CONSTRAINT `BUKU_kd_penerbit_fkey` FOREIGN KEY (`kd_penerbit`) REFERENCES `PENERBIT`(`kd_penerbit`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BUKU` ADD CONSTRAINT `BUKU_kd_klasifikasi_fkey` FOREIGN KEY (`kd_klasifikasi`) REFERENCES `KLASIFIKASI`(`kd_klasifikasi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BUKU` ADD CONSTRAINT `BUKU_kd_pengarang_fkey` FOREIGN KEY (`kd_pengarang`) REFERENCES `PENGARANG`(`kd_pengarang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `INVENTARIS` ADD CONSTRAINT `INVENTARIS_kd_buku_fkey` FOREIGN KEY (`kd_buku`) REFERENCES `BUKU`(`kd_buku`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PINJAM` ADD CONSTRAINT `PINJAM_kd_anggota_fkey` FOREIGN KEY (`kd_anggota`) REFERENCES `ANGGOTA`(`kd_anggota`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PINJAM` ADD CONSTRAINT `PINJAM_kd_petugas_fkey` FOREIGN KEY (`kd_petugas`) REFERENCES `PETUGAS`(`kd_petugas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DETPINJAM` ADD CONSTRAINT `DETPINJAM_no_pinjam_fkey` FOREIGN KEY (`no_pinjam`) REFERENCES `PINJAM`(`no_pinjam`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DETPINJAM` ADD CONSTRAINT `DETPINJAM_no_inventaris_fkey` FOREIGN KEY (`no_inventaris`) REFERENCES `INVENTARIS`(`no_inventaris`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DENDA` ADD CONSTRAINT `DENDA_no_pinjam_fkey` FOREIGN KEY (`no_pinjam`) REFERENCES `PINJAM`(`no_pinjam`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DENDA` ADD CONSTRAINT `DENDA_no_inventaris_fkey` FOREIGN KEY (`no_inventaris`) REFERENCES `INVENTARIS`(`no_inventaris`) ON DELETE CASCADE ON UPDATE CASCADE;
