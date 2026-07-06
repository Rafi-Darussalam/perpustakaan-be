import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";

export const getAllPenerbit = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.penerbit.findMany();
    res.status(200).json(data);
  } catch (error) {
    console.error("Get All Penerbit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPenerbitById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await prisma.penerbit.findUnique({
      where: { kd_penerbit: Number(id) },
    });
    if (!data) {
      res.status(404).json({ message: "Penerbit not found" });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Penerbit By Id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPenerbit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nm_penerbit, alamat, telp } = req.body;
    const data = await prisma.penerbit.create({
      data: { nm_penerbit, alamat, telp },
    });
    res.status(201).json(data);
  } catch (error) {
    console.error("Create Penerbit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePenerbit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nm_penerbit, alamat, telp } = req.body;
    const data = await prisma.penerbit.update({
      where: { kd_penerbit: Number(id) },
      data: { nm_penerbit, alamat, telp },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Penerbit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePenerbit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.penerbit.delete({
      where: { kd_penerbit: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Delete Penerbit error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
