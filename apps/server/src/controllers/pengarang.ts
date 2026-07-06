import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";

export const getAllPengarang = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.pengarang.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Get All Pengarang error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPengarangById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await prisma.pengarang.findUnique({
      where: { kd_pengarang: Number(id) },
    });
    if (!data) {
      res.status(404).json({ message: "Pengarang not found" });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Pengarang By Id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPengarang = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nm_pengarang, jenis_kelamin } = req.body;
    const data = await prisma.pengarang.create({
      data: { nm_pengarang, jenis_kelamin },
    });
    res.status(201).json(data);
  } catch (error) {
    console.error("Create Pengarang error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePengarang = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nm_pengarang, jenis_kelamin } = req.body;
    const data = await prisma.pengarang.update({
      where: { kd_pengarang: Number(id) },
      data: { nm_pengarang, jenis_kelamin },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Pengarang error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePengarang = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.pengarang.delete({
      where: { kd_pengarang: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Delete Pengarang error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
