import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";

export const createPinjam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { kd_anggota, kd_petugas, no_inventaris_list } = req.body;

    if (!kd_anggota || !kd_petugas || !Array.isArray(no_inventaris_list) || no_inventaris_list.length === 0) {
      res.status(400).json({ message: "kd_anggota, kd_petugas, dan no_inventaris_list (array) wajib diisi" });
      return;
    }

    const config = await prisma.konfigurasi.findUnique({ where: { kunci: "lama_pinjam" } });
    const lamaPinjam = config ? Number(config.nilai) : 7;

    const tglPinjam = new Date();
    const tglHarusKembali = new Date(tglPinjam);
    tglHarusKembali.setDate(tglHarusKembali.getDate() + lamaPinjam);

    const result = await prisma.$transaction(async (tx) => {
      for (const no of no_inventaris_list) {
        const inv = await tx.inventaris.findUnique({ where: { no_inventaris: Number(no) } });
        if (!inv) {
          throw { status: 404, message: `Inventaris dengan no ${no} tidak ditemukan` };
        }
        if (inv.status_buku !== "tersedia") {
          throw { status: 409, message: `Inventaris no ${no} tidak tersedia (status: ${inv.status_buku})` };
        }
      }

      const pinjam = await tx.pinjam.create({
        data: {
          kd_anggota: Number(kd_anggota),
          kd_petugas: Number(kd_petugas),
          tgl_pinjam: tglPinjam,
          tgl_harus_kembali: tglHarusKembali,
        },
      });

      for (const no of no_inventaris_list) {
        await tx.detpinjam.create({
          data: {
            no_pinjam: pinjam.no_pinjam,
            no_inventaris: Number(no),
            tgl_pinjam: tglPinjam,
            status_pinjam: "dipinjam",
          },
        });
        await tx.inventaris.update({
          where: { no_inventaris: Number(no) },
          data: { status_buku: "dipinjam" },
        });
      }

      return pinjam;
    });

    res.status(201).json({
      message: "Peminjaman berhasil dibuat",
      data: result,
    });
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status && err.message) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error("Create Pinjam error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPinjam = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.pinjam.findMany({
      include: {
        anggota: true,
        petugas: true,
        detpinjam: {
          include: { inventaris: { include: { buku: true } } },
        },
      },
      orderBy: { tgl_pinjam: "desc" },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Get All Pinjam error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPinjamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await prisma.pinjam.findUnique({
      where: { no_pinjam: Number(id) },
      include: {
        anggota: true,
        petugas: true,
        detpinjam: {
          include: { inventaris: { include: { buku: true } } },
        },
        denda: true,
      },
    });
    if (!data) {
      res.status(404).json({ message: "Data pinjam tidak ditemukan" });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Pinjam By Id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const kembalikanItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { no_pinjam, no_inventaris } = req.body;

    if (!no_pinjam || !no_inventaris) {
      res.status(400).json({ message: "no_pinjam dan no_inventaris wajib diisi" });
      return;
    }

    const detpinjam = await prisma.detpinjam.findUnique({
      where: { no_pinjam_no_inventaris: { no_pinjam: Number(no_pinjam), no_inventaris: Number(no_inventaris) } },
      include: { pinjam: true },
    });

    if (!detpinjam) {
      res.status(404).json({ message: "Data detail pinjam tidak ditemukan" });
      return;
    }
    if (detpinjam.status_pinjam === "kembali") {
      res.status(409).json({ message: "Item ini sudah dikembalikan" });
      return;
    }

    const configTarif = await prisma.konfigurasi.findUnique({ where: { kunci: "tarif_denda" } });
    const tarifPerHari = configTarif ? Number(configTarif.nilai) : 1000;

    const tglKembali = new Date();
    const tglHarusKembali = new Date(detpinjam.pinjam.tgl_harus_kembali);
    const selisihMs = tglKembali.getTime() - tglHarusKembali.getTime();
    const hariTerlambat = Math.max(0, Math.floor(selisihMs / (1000 * 60 * 60 * 24)));

    const result = await prisma.$transaction(async (tx) => {
      await tx.detpinjam.update({
        where: { no_pinjam_no_inventaris: { no_pinjam: Number(no_pinjam), no_inventaris: Number(no_inventaris) } },
        data: { status_pinjam: "kembali" },
      });

      await tx.inventaris.update({
        where: { no_inventaris: Number(no_inventaris) },
        data: { status_buku: "tersedia" },
      });

      let denda = null;
      if (hariTerlambat > 0) {
        const jmlhDenda = hariTerlambat * tarifPerHari;
        denda = await tx.denda.create({
          data: {
            no_pinjam: Number(no_pinjam),
            no_inventaris: Number(no_inventaris),
            tgl_denda: tglKembali,
            jmlh_denda: String(jmlhDenda),
            lunas: false,
          },
        });
      }

      return { hariTerlambat, denda };
    });

    res.status(200).json({
      message: "Pengembalian berhasil diproses",
      terlambat: result.hariTerlambat > 0,
      hari_terlambat: result.hariTerlambat,
      denda: result.denda,
    });
  } catch (error) {
    console.error("Kembalikan Item error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const lunaskanDenda = async (req: Request, res: Response): Promise<void> => {
  try {
    const { no_pinjam, no_inventaris } = req.params;
    const denda = await prisma.denda.update({
      where: { no_pinjam_no_inventaris: { no_pinjam: Number(no_pinjam), no_inventaris: Number(no_inventaris) } },
      data: { lunas: true },
    });
    res.status(200).json({ message: "Denda telah dilunasi", denda });
  } catch (error) {
    console.error("Lunaskan Denda error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDendaByPinjam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await prisma.denda.findMany({
      where: { no_pinjam: Number(id) },
      include: { inventaris: { include: { buku: true } } },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Denda error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHistoriAnggota = async (req: Request, res: Response): Promise<void> => {
  try {
    const { kd_anggota } = req.params;

    const anggota = await prisma.anggota.findUnique({
      where: { kd_anggota: Number(kd_anggota) },
    });

    if (!anggota) {
      res.status(404).json({ message: "Anggota tidak ditemukan" });
      return;
    }

    const pinjamList = await prisma.pinjam.findMany({
      where: { kd_anggota: Number(kd_anggota) },
      orderBy: { tgl_pinjam: "desc" },
      include: {
        petugas: { select: { kd_petugas: true, nm_petugas: true } },
        detpinjam: {
          include: {
            inventaris: {
              include: { buku: { include: { pengarang: true, klasifikasi: true } } },
            },
          },
        },
        denda: {
          include: {
            inventaris: { include: { buku: true } },
          },
        },
      },
    });

    const totalDendaBelumLunas = pinjamList.reduce((acc, pinjam) => {
      return acc + pinjam.denda.filter((d) => !d.lunas).reduce((sum, d) => sum + Number(d.jmlh_denda), 0);
    }, 0);

    res.status(200).json({
      anggota,
      total_denda_belum_lunas: totalDendaBelumLunas,
      total_pinjam: pinjamList.length,
      histori: pinjamList,
    });
  } catch (error) {
    console.error("Get Histori Anggota error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
