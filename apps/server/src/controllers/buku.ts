import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";

export const getAllBuku = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.buku.findMany({
      include: {
        penerbit: true,
        pengarang: true,
        klasifikasi: true,
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Get All Buku error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBukuById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await prisma.buku.findUnique({
      where: { kd_buku: Number(id) },
      include: {
        penerbit: true,
        pengarang: true,
        klasifikasi: true,
      },
    });
    if (!data) {
      res.status(404).json({ message: "Buku not found" });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Buku By Id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      judul,
      kd_penerbit,
      kd_klasifikasi,
      thn_terbit,
      bahasa,
      edisi,
      ISBN,
      jumlah,
      kd_pengarang,
    } = req.body;

    const data = await prisma.buku.create({
      data: {
        judul,
        kd_penerbit: Number(kd_penerbit),
        kd_klasifikasi: Number(kd_klasifikasi),
        thn_terbit,
        bahasa,
        edisi,
        ISBN,
        jumlah,
        kd_pengarang: Number(kd_pengarang),
      },
    });
    res.status(201).json(data);
  } catch (error) {
    console.error("Create Buku error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      judul,
      kd_penerbit,
      kd_klasifikasi,
      thn_terbit,
      bahasa,
      edisi,
      ISBN,
      jumlah,
      kd_pengarang,
    } = req.body;

    const data = await prisma.buku.update({
      where: { kd_buku: Number(id) },
      data: {
        judul,
        kd_penerbit: Number(kd_penerbit),
        kd_klasifikasi: Number(kd_klasifikasi),
        thn_terbit,
        bahasa,
        edisi,
        ISBN,
        jumlah,
        kd_pengarang: Number(kd_pengarang),
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Buku error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.buku.delete({
      where: { kd_buku: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Delete Buku error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
