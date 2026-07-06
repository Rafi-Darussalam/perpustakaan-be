import prisma from "@perpustakaan-be/db";
import type { Request, Response } from "express";

export const getAllInventaris = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.inventaris.findMany({
      include: { buku: true },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Get All Inventaris error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInventarisById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await prisma.inventaris.findUnique({
      where: { no_inventaris: Number(id) },
      include: { buku: true },
    });
    if (!data) {
      res.status(404).json({ message: "Inventaris not found" });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Inventaris By Id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createInventaris = async (req: Request, res: Response): Promise<void> => {
  try {
    const { kd_buku, no_buku, tgl_masuk, status_buku } = req.body;
    const data = await prisma.inventaris.create({
      data: {
        kd_buku: Number(kd_buku),
        no_buku,
        tgl_masuk,
        status_buku: status_buku ?? "tersedia",
      },
    });
    res.status(201).json(data);
  } catch (error) {
    console.error("Create Inventaris error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStatusInventaris = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status_buku } = req.body;

    const allowedStatus = ["tersedia", "dipinjam", "rusak", "hilang"];
    if (!allowedStatus.includes(status_buku)) {
      res.status(400).json({
        message: `Status tidak valid. Pilihan: ${allowedStatus.join(", ")}`,
      });
      return;
    }

    const data = await prisma.inventaris.update({
      where: { no_inventaris: Number(id) },
      data: { status_buku },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Status Inventaris error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateInventaris = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { kd_buku, no_buku, tgl_masuk, status_buku } = req.body;

    const allowedStatus = ["tersedia", "dipinjam", "rusak", "hilang"];
    if (status_buku && !allowedStatus.includes(status_buku)) {
      res.status(400).json({
        message: `Status tidak valid. Pilihan: ${allowedStatus.join(", ")}`,
      });
      return;
    }

    const data = await prisma.inventaris.update({
      where: { no_inventaris: Number(id) },
      data: {
        kd_buku: kd_buku ? Number(kd_buku) : undefined,
        no_buku,
        tgl_masuk,
        status_buku,
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Update Inventaris error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteInventaris = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.inventaris.delete({
      where: { no_inventaris: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Delete Inventaris error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
