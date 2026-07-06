import { Router } from "express";
import type { RequestHandler } from "express";
import {
  getAllInventaris,
  getInventarisById,
  createInventaris,
  updateInventaris,
  updateStatusInventaris,
  deleteInventaris,
} from "../controllers/inventaris";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const inventarisRouter: Router = Router();

inventarisRouter.use(authenticateJWT as unknown as RequestHandler);
inventarisRouter.use(authorizeRole("ADMIN", "PETUGAS") as unknown as RequestHandler);

inventarisRouter.get("/", getAllInventaris as unknown as RequestHandler);
inventarisRouter.get("/:id", getInventarisById as unknown as RequestHandler);
inventarisRouter.post("/", createInventaris as unknown as RequestHandler);
inventarisRouter.put("/:id", updateInventaris as unknown as RequestHandler);
inventarisRouter.patch("/:id/status", updateStatusInventaris as unknown as RequestHandler);
inventarisRouter.delete("/:id", deleteInventaris as unknown as RequestHandler);

export default inventarisRouter;
