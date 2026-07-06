import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";

export const getAllBuku = async (req: Request, res: Response): Promise<void> => {
  try {
    const { judul, pengarang, penerbit, klasifikasi, page, limit } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(judul && {
        judul: { contains: String(judul).trim() },
      }),
      ...(pengarang && {
        pengarang: { nm_pengarang: { contains: String(pengarang).trim() } },
      }),
      ...(penerbit && {
        penerbit: { nm_penerbit: { contains: String(penerbit).trim() } },
      }),
      ...(klasifikasi && {
        klasifikasi: { nm_klasifikasi: { contains: String(klasifikasi).trim() } },
      }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.buku.findMany({
        where,
        include: {
          penerbit: true,
          pengarang: true,
          klasifikasi: true,
        },
        skip,
        take: limitNum,
        orderBy: { judul: "asc" },
      }),
      prisma.buku.count({ where }),
    ]);

    res.status(200).json({ data, total, page: pageNum, limit: limitNum });
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
