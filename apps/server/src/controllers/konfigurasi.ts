import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";
import { z } from "zod";

const konfigurasiSchema = z.object({
  lama_pinjam: z.number().int().positive("Lama pinjam harus angka positif"),
  tarif_denda: z.number().int().positive("Tarif denda harus angka positif"),
});

export const getKonfigurasi = async (_req: Request, res: Response): Promise<void> => {
  try {
    const konfig = await prisma.konfigurasi.findMany();
    
    // Default values if not found in db
    let lama_pinjam = 7;
    let tarif_denda = 1000;

    for (const item of konfig) {
      if (item.kunci === "lama_pinjam") {
        lama_pinjam = Number(item.nilai);
      } else if (item.kunci === "tarif_denda") {
        tarif_denda = Number(item.nilai);
      }
    }

    res.status(200).json({ lama_pinjam, tarif_denda });
  } catch (error) {
    console.error("Get Konfigurasi error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateKonfigurasi = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = konfigurasiSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: "Validasi gagal",
        errors: validationResult.error.format(),
      });
      return;
    }

    const { lama_pinjam, tarif_denda } = validationResult.data;

    await prisma.$transaction([
      prisma.konfigurasi.upsert({
        where: { kunci: "lama_pinjam" },
        update: { nilai: String(lama_pinjam) },
        create: { kunci: "lama_pinjam", nilai: String(lama_pinjam) },
      }),
      prisma.konfigurasi.upsert({
        where: { kunci: "tarif_denda" },
        update: { nilai: String(tarif_denda) },
        create: { kunci: "tarif_denda", nilai: String(tarif_denda) },
      }),
    ]);

    res.status(200).json({
      message: "Konfigurasi berhasil diperbarui",
      data: { lama_pinjam, tarif_denda },
    });
  } catch (error) {
    console.error("Update Konfigurasi error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
