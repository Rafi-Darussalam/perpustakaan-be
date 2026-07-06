import { Router } from "express";
import type { RequestHandler } from "express";
import {
  createPinjam,
  getAllPinjam,
  getPinjamById,
  kembalikanItem,
  getDendaByPinjam,
  lunaskanDenda,
  getHistoriAnggota,
} from "../controllers/pinjam";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const pinjamRouter: Router = Router();

pinjamRouter.use(authenticateJWT as unknown as RequestHandler);

pinjamRouter.get("/", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, getAllPinjam as unknown as RequestHandler);
pinjamRouter.get("/anggota/:kd_anggota/histori", authorizeRole("ADMIN", "PETUGAS", "ANGGOTA") as unknown as RequestHandler, getHistoriAnggota as unknown as RequestHandler);
pinjamRouter.get("/:id", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, getPinjamById as unknown as RequestHandler);
pinjamRouter.post("/", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, createPinjam as unknown as RequestHandler);
pinjamRouter.post("/kembali", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, kembalikanItem as unknown as RequestHandler);
pinjamRouter.get("/:id/denda", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, getDendaByPinjam as unknown as RequestHandler);
pinjamRouter.patch("/:no_pinjam/denda/:no_inventaris/lunas", authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler, lunaskanDenda as unknown as RequestHandler);

export default pinjamRouter;
