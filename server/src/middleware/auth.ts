import { Request, Response, NextFunction } from "express";
import { verifyAccess, verifyRefresh, signAccess } from "../utils/jwt";

declare global {
  namespace Express { interface Request { userId?: string; } }
}

export const cookieOpts = (maxAge = 15 * 60 * 1000) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge
});

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies["access_token"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const { uid } = verifyAccess(token);
    req.userId = uid;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
