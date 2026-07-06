import { Router } from "express";
import type { RequestHandler } from "express";
import { getRingkasanPetugas, getDashboardAdmin } from "../controllers/dashboard";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const dashboardRouter: Router = Router();

dashboardRouter.use(authenticateJWT as unknown as RequestHandler);

dashboardRouter.get(
  "/ringkasan",
  authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler,
  getRingkasanPetugas as unknown as RequestHandler,
);

dashboardRouter.get(
  "/admin",
  authorizeRole("ADMIN") as unknown as RequestHandler,
  getDashboardAdmin as unknown as RequestHandler,
);

export default dashboardRouter;
