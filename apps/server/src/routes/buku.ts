import { Router } from "express";
import type { RequestHandler } from "express";
import {
  getAllBuku,
  getBukuById,
  createBuku,
  updateBuku,
  deleteBuku,
} from "../controllers/buku";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const bukuRouter: Router = Router();

bukuRouter.use(authenticateJWT as unknown as RequestHandler);

bukuRouter.get("/", authorizeRole("ADMIN", "PETUGAS", "ANGGOTA") as unknown as RequestHandler, getAllBuku as unknown as RequestHandler);
bukuRouter.get("/:id", authorizeRole("ADMIN", "PETUGAS", "ANGGOTA") as unknown as RequestHandler, getBukuById as unknown as RequestHandler);
bukuRouter.post("/", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, createBuku as unknown as RequestHandler);
bukuRouter.put("/:id", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, updateBuku as unknown as RequestHandler);
bukuRouter.delete("/:id", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, deleteBuku as unknown as RequestHandler);

export default bukuRouter;
