import { Router } from "express";
import type { RequestHandler } from "express";
import { getKonfigurasi, updateKonfigurasi } from "../controllers/konfigurasi";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const konfigurasiRouter: Router = Router();

konfigurasiRouter.use(authenticateJWT as unknown as RequestHandler);
konfigurasiRouter.use(authorizeRole("ADMIN") as unknown as RequestHandler);

konfigurasiRouter.get("/", getKonfigurasi as unknown as RequestHandler);
konfigurasiRouter.put("/", updateKonfigurasi as unknown as RequestHandler);

export default konfigurasiRouter;
