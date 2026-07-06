import { Router } from "express";
import type { RequestHandler } from "express";
import {
  getAllKlasifikasi,
  getKlasifikasiById,
  createKlasifikasi,
  updateKlasifikasi,
  deleteKlasifikasi,
} from "../controllers/klasifikasi";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const klasifikasiRouter: Router = Router();

klasifikasiRouter.use(authenticateJWT as unknown as RequestHandler);
klasifikasiRouter.use(authorizeRole("ADMIN") as unknown as RequestHandler);

klasifikasiRouter.get("/", getAllKlasifikasi as unknown as RequestHandler);
klasifikasiRouter.get("/:id", getKlasifikasiById as unknown as RequestHandler);
klasifikasiRouter.post("/", createKlasifikasi as unknown as RequestHandler);
klasifikasiRouter.put("/:id", updateKlasifikasi as unknown as RequestHandler);
klasifikasiRouter.delete("/:id", deleteKlasifikasi as unknown as RequestHandler);

export default klasifikasiRouter;
