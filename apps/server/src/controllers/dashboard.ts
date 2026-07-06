import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";

export const getRingkasanPetugas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sekarang = new Date();

    const [
      totalBuku,
      totalInventaris,
      totalAnggota,
      sedangDipinjam,
      terlambat,
      dendaBelumLunas,
    ] = await Promise.all([
      prisma.buku.count(),

      prisma.inventaris.count(),

      prisma.anggota.count(),

      prisma.detpinjam.count({
        where: { status_pinjam: "dipinjam" },
      }),

      prisma.detpinjam.count({
        where: {
          status_pinjam: "dipinjam",
          pinjam: { tgl_harus_kembali: { lt: sekarang } },
        },
      }),

      prisma.denda.count({
        where: { lunas: false },
      }),
    ]);

    res.status(200).json({
      total_buku: totalBuku,
      total_inventaris: totalInventaris,
      total_anggota: totalAnggota,
      sedang_dipinjam: sedangDipinjam,
      terlambat,
      denda_belum_lunas: dendaBelumLunas,
    });
  } catch (error) {
    console.error("Get Ringkasan Petugas error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDashboardAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sekarang = new Date();
    const awalBulanIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1);
    const awalBulanLalu = new Date(sekarang.getFullYear(), sekarang.getMonth() - 1, 1);
    const akhirBulanLalu = new Date(sekarang.getFullYear(), sekarang.getMonth(), 0, 23, 59, 59);

    const [
      totalBuku,
      totalInventaris,
      totalAnggota,
      sedangDipinjam,
      terlambat,
      dendaBelumLunas,
      totalNilaiDendaBelumLunas,
      pinjamBulanIni,
      pinjamBulanLalu,
      anggotaBulanIni,
      dendaLunasBulanIni,
      bukuTerpopuler,
      inventarisTersedia,
      inventarisDipinjam,
    ] = await Promise.all([
      prisma.buku.count(),

      prisma.inventaris.count(),

      prisma.anggota.count(),

      prisma.detpinjam.count({
        where: { status_pinjam: "dipinjam" },
      }),

      prisma.detpinjam.count({
        where: {
          status_pinjam: "dipinjam",
          pinjam: { tgl_harus_kembali: { lt: sekarang } },
        },
      }),

      prisma.denda.count({
        where: { lunas: false },
      }),

      prisma.denda.findMany({
        where: { lunas: false },
        select: { jmlh_denda: true },
      }),

      prisma.pinjam.count({
        where: { tgl_pinjam: { gte: awalBulanIni } },
      }),

      prisma.pinjam.count({
        where: { tgl_pinjam: { gte: awalBulanLalu, lte: akhirBulanLalu } },
      }),

      prisma.anggota.count({
        where: { tgl_daftar: { gte: awalBulanIni } },
      }),

      prisma.denda.findMany({
        where: { lunas: true, tgl_denda: { gte: awalBulanIni } },
        select: { jmlh_denda: true },
      }),

      prisma.detpinjam.groupBy({
        by: ["no_inventaris"],
        _count: { no_inventaris: true },
        orderBy: { _count: { no_inventaris: "desc" } },
        take: 5,
      }),

      prisma.inventaris.count({ where: { status_buku: "tersedia" } }),

      prisma.inventaris.count({ where: { status_buku: "dipinjam" } }),
    ]);

    const totalNilaiDenda = totalNilaiDendaBelumLunas.reduce(
      (sum, d) => sum + Number(d.jmlh_denda),
      0,
    );

    const totalPendapatanDendaBulanIni = dendaLunasBulanIni.reduce(
      (sum, d) => sum + Number(d.jmlh_denda),
      0,
    );

    const topInventarisIds = bukuTerpopuler.map((b) => b.no_inventaris);
    const topInventarisDetail = await prisma.inventaris.findMany({
      where: { no_inventaris: { in: topInventarisIds } },
      include: { buku: { include: { pengarang: true } } },
    });

    const bukuPopulerWithCount = bukuTerpopuler.map((b) => {
      const detail = topInventarisDetail.find((i) => i.no_inventaris === b.no_inventaris);
      return {
        no_inventaris: b.no_inventaris,
        jumlah_pinjam: b._count.no_inventaris,
        buku: detail?.buku ?? null,
      };
    });

    res.status(200).json({
      ringkasan: {
        total_buku: totalBuku,
        total_inventaris: totalInventaris,
        total_anggota: totalAnggota,
        sedang_dipinjam: sedangDipinjam,
        terlambat,
        denda_belum_lunas: dendaBelumLunas,
        total_nilai_denda_belum_lunas: totalNilaiDenda,
      },
      statistik_bulan_ini: {
        pinjam_baru: pinjamBulanIni,
        pinjam_bulan_lalu: pinjamBulanLalu,
        anggota_baru: anggotaBulanIni,
        pendapatan_denda: totalPendapatanDendaBulanIni,
      },
      inventaris_status: {
        tersedia: inventarisTersedia,
        dipinjam: inventarisDipinjam,
      },
      buku_terpopuler: bukuPopulerWithCount,
    });
  } catch (error) {
    console.error("Get Dashboard Admin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
