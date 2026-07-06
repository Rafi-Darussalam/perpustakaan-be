import { env } from "@perpustakaan-be/env/server";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized: Missing token" });
      return;
    }
    jwt.verify(token, env.JWT_SECRET as string, (err, user) => {
      if (err) {
        res.status(403).json({ message: "Forbidden: Invalid token" });
        return;
      }

      req.user = user as AuthRequest["user"];
      next();
    });
  } else {
    res.status(401).json({ message: "Unauthorized: Missing token" });
  }
};

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    }
    next();
  };
};
