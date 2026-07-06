-- DropForeignKey
ALTER TABLE `inventaris` DROP FOREIGN KEY `INVENTARIS_kd_buku_fkey`;

-- DropIndex
DROP INDEX `INVENTARIS_kd_buku_fkey` ON `inventaris`;

-- AlterTable
ALTER TABLE `denda` MODIFY `jmlh_denda` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `USER` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('PETUGAS', 'ANGGOTA', 'ADMIN') NOT NULL DEFAULT 'ANGGOTA',

    UNIQUE INDEX `USER_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `INVENTARIS` ADD CONSTRAINT `INVENTARIS_kd_buku_fkey` FOREIGN KEY (`kd_buku`) REFERENCES `BUKU`(`kd_buku`) ON DELETE RESTRICT ON UPDATE CASCADE;
