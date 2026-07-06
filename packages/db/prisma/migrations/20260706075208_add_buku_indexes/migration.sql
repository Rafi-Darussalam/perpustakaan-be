-- CreateIndex
CREATE INDEX `BUKU_judul_idx` ON `BUKU`(`judul`);

-- RenameIndex
ALTER TABLE `buku` RENAME INDEX `BUKU_kd_klasifikasi_fkey` TO `BUKU_kd_klasifikasi_idx`;

-- RenameIndex
ALTER TABLE `buku` RENAME INDEX `BUKU_kd_penerbit_fkey` TO `BUKU_kd_penerbit_idx`;

-- RenameIndex
ALTER TABLE `buku` RENAME INDEX `BUKU_kd_pengarang_fkey` TO `BUKU_kd_pengarang_idx`;
