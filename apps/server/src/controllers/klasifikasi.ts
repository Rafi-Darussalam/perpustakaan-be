import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";

export const getAllKlasifikasi = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.klasifikasi.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Get All Klasifikasi error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getKlasifikasiById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await prisma.klasifikasi.findUnique({
      where: { kd_klasifikasi: Number(id) },
    });
    if (!data) {
      res.status(404).json({ message: "Klasifikasi not found" });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Klasifikasi By Id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createKlasifikasi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nm_klasifikasi } = req.body;
    const data = await prisma.klasifikasi.create({
      data: { nm_klasifikasi },
    });
    res.status(201).json(data);
  } catch (error) {
    console.error("Create Klasifikasi error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateKlasifikasi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nm_klasifikasi } = req.body;
    const data = await prisma.klasifikasi.update({
      where: { kd_klasifikasi: Number(id) },
      data: { nm_klasifikasi },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Klasifikasi error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteKlasifikasi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.klasifikasi.delete({
      where: { kd_klasifikasi: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Delete Klasifikasi error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
