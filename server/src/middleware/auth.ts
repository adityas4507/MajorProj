import { NextFunction, Request, Response } from "express";
import "multer"; // Ensure Multer types are augmented
import { prisma } from "../index";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
  file?: Express.Multer.File;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = "";
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    
    // Optional: Check if user exists and is not deleted (can be cached or skipped for speed if JWT is trusted)
    // For strict security, we check DB:
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.isDeleted) {
       return res.status(403).json({ error: "User not found or deleted" });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
