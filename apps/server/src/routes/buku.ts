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
bukuRouter.use(authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler);

bukuRouter.get("/", getAllBuku as unknown as RequestHandler);
bukuRouter.get("/:id", getBukuById as unknown as RequestHandler);
bukuRouter.post("/", createBuku as unknown as RequestHandler);
bukuRouter.put("/:id", updateBuku as unknown as RequestHandler);
bukuRouter.delete("/:id", deleteBuku as unknown as RequestHandler);

export default bukuRouter;
