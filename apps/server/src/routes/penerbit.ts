import { Router } from "express";
import type { RequestHandler } from "express";
import {
  getAllPenerbit,
  getPenerbitById,
  createPenerbit,
  updatePenerbit,
  deletePenerbit,
} from "../controllers/penerbit";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const penerbitRouter: Router = Router();

penerbitRouter.use(authenticateJWT as unknown as RequestHandler);
penerbitRouter.use(authorizeRole("ADMIN") as unknown as RequestHandler);

penerbitRouter.get("/", getAllPenerbit as unknown as RequestHandler);
penerbitRouter.get("/:id", getPenerbitById as unknown as RequestHandler);
penerbitRouter.post("/", createPenerbit as unknown as RequestHandler);
penerbitRouter.put("/:id", updatePenerbit as unknown as RequestHandler);
penerbitRouter.delete("/:id", deletePenerbit as unknown as RequestHandler);

export default penerbitRouter;
