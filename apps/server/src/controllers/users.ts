import prisma from "@perpustakaan-be/db";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { Role } from "@perpustakaan-be/db/generated";
import type { AuthRequest } from "../middlewares/auth";

const ALLOWED_ROLES: Role[] = ["ANGGOTA", "PETUGAS", "ADMIN"];

const cekSatuSatunyaAdminAktif = async (targetId: number): Promise<boolean> => {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { role: true },
  });
  if (target?.role !== "ADMIN") return false;

  const jumlahAdminAktif = await prisma.user.count({
    where: { role: "ADMIN", status_aktif: true },
  });
  return jumlahAdminAktif <= 1;
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status_aktif } = req.query;

    const filterAktif =
      status_aktif === "true" ? true : status_aktif === "false" ? false : undefined;

    const data = await prisma.user.findMany({
      where: filterAktif !== undefined ? { status_aktif: filterAktif } : undefined,
      select: { id: true, username: true, role: true, status_aktif: true },
      orderBy: { id: "asc" },
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Get All Users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, username: true, role: true, status_aktif: true },
    });
    if (!data) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Get User By Id error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username dan password wajib diisi" });
      return;
    }

    const selectedRole: Role = ALLOWED_ROLES.includes(role) ? role : "ANGGOTA";

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(409).json({ message: "Username sudah digunakan" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const data = await prisma.user.create({
      data: { username, password: hashedPassword, role: selectedRole },
      select: { id: true, username: true, role: true, status_aktif: true },
    });

    res.status(201).json(data);
  } catch (error) {
    console.error("Create User error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, role } = req.body;
    const targetId = Number(id);

    if (role && !ALLOWED_ROLES.includes(role)) {
      res.status(400).json({ message: "Role tidak valid" });
      return;
    }

    if (role && role !== "ADMIN") {
      const satu_satunya = await cekSatuSatunyaAdminAktif(targetId);
      if (satu_satunya) {
        res
          .status(422)
          .json({ message: "Tidak bisa mengubah role satu-satunya Admin aktif" });
        return;
      }
    }

    const updateData: { username?: string; role?: Role } = {};
    if (username) updateData.username = username;
    if (role) updateData.role = role as Role;

    const data = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, username: true, role: true, status_aktif: true },
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Update User error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const nonaktifkanUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const targetId = Number(id);

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, status_aktif: true, role: true },
    });

    if (!target) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    if (!target.status_aktif) {
      res.status(409).json({ message: "Akun sudah tidak aktif" });
      return;
    }

    const satu_satunya = await cekSatuSatunyaAdminAktif(targetId);
    if (satu_satunya) {
      res
        .status(422)
        .json({ message: "Tidak bisa menonaktifkan satu-satunya Admin aktif" });
      return;
    }

    const data = await prisma.user.update({
      where: { id: targetId },
      data: { status_aktif: false },
      select: { id: true, username: true, role: true, status_aktif: true },
    });

    res.status(200).json({ message: "Akun berhasil dinonaktifkan", data });
  } catch (error) {
    console.error("Nonaktifkan User error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const aktifkanUser = async (_req: Request, res: Response & { locals: { params: { id: string } } }): Promise<void> => {
  res.status(200).json({ message: "placeholder" });
};

export const reaktifkanUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const target = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, status_aktif: true },
    });

    if (!target) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    if (target.status_aktif) {
      res.status(409).json({ message: "Akun sudah aktif" });
      return;
    }

    const data = await prisma.user.update({
      where: { id: Number(id) },
      data: { status_aktif: true },
      select: { id: true, username: true, role: true, status_aktif: true },
    });

    res.status(200).json({ message: "Akun berhasil diaktifkan kembali", data });
  } catch (error) {
    console.error("Reaktifkan User error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const target = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!target) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    const passwordBaru = Array.from({ length: 12 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join("");

    const hashedPassword = await bcrypt.hash(passwordBaru, 10);

    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: "Password berhasil direset",
      password_baru: passwordBaru,
    });
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfilMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetId = req.user?.id;
    if (!targetId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, username: true, role: true, status_aktif: true, nama: true, email: true, kontak: true },
    });
    if (!data) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Get Profil Me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfilMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetId = req.user?.id;
    if (!targetId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { nama, email, kontak } = req.body;

    const updateData: { nama?: string; email?: string; kontak?: string } = {};
    if (nama !== undefined) updateData.nama = nama;
    if (email !== undefined) updateData.email = email;
    if (kontak !== undefined) updateData.kontak = kontak;

    const data = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, username: true, role: true, status_aktif: true, nama: true, email: true, kontak: true },
    });

    res.status(200).json({ message: "Profil berhasil diperbarui", data });
  } catch (error) {
    console.error("Update Profil Me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePasswordMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetId = req.user?.id;
    if (!targetId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { password_lama, password_baru } = req.body;
    if (!password_lama || !password_baru) {
      res.status(400).json({ message: "Password lama dan password baru wajib diisi" });
      return;
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password_lama, target.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Password lama tidak sesuai" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password_baru, 10);

    await prisma.user.update({
      where: { id: targetId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Update Password Me error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
