import { Router } from "express";
import type { RequestHandler } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  nonaktifkanUser,
  reaktifkanUser,
  resetPassword,
  getProfilMe,
  updateProfilMe,
  updatePasswordMe,
} from "../controllers/users";
import { authenticateJWT, authorizeRole } from "../middlewares/auth";

const usersRouter: Router = Router();

usersRouter.use(authenticateJWT as unknown as RequestHandler);
usersRouter.use(authorizeRole("ADMIN") as unknown as RequestHandler);

usersRouter.get("/me/profil", getProfilMe as unknown as RequestHandler);
usersRouter.put("/me/profil", updateProfilMe as unknown as RequestHandler);
usersRouter.put("/me/password", updatePasswordMe as unknown as RequestHandler);

usersRouter.get("/", getAllUsers as unknown as RequestHandler);
usersRouter.get("/:id", getUserById as unknown as RequestHandler);
usersRouter.post("/", createUser as unknown as RequestHandler);
usersRouter.put("/:id", updateUser as unknown as RequestHandler);
usersRouter.patch("/:id/nonaktifkan", nonaktifkanUser as unknown as RequestHandler);
usersRouter.patch("/:id/reaktifkan", reaktifkanUser as unknown as RequestHandler);
usersRouter.patch("/:id/reset-password", resetPassword as unknown as RequestHandler);

export default usersRouter;
