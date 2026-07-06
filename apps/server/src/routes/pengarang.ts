import { Router } from "express";
import type { RequestHandler } from "express";
import {
  getAllPengarang,
  getPengarangById,
  createPengarang,
  updatePengarang,
  deletePengarang,
} from "../controllers/pengarang";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const pengarangRouter: Router = Router();

pengarangRouter.use(authenticateJWT as unknown as RequestHandler);
pengarangRouter.use(authorizeRole("ADMIN") as unknown as RequestHandler);

pengarangRouter.get("/", getAllPengarang as unknown as RequestHandler);
pengarangRouter.get("/:id", getPengarangById as unknown as RequestHandler);
pengarangRouter.post("/", createPengarang as unknown as RequestHandler);
pengarangRouter.put("/:id", updatePengarang as unknown as RequestHandler);
pengarangRouter.delete("/:id", deletePengarang as unknown as RequestHandler);

export default pengarangRouter;
