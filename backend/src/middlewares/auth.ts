import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const header = req.headers.authorization;

  if (!header) {

    return res.status(401).json({
      error: "No token"
    });

  }

  const token = header.split(" ")[1];

  try {

    const decoded = verifyAccessToken(token);

    (req as any).user = decoded;

    next();

  } catch {

    return res.status(401).json({
      error: "Invalid or expired token"
    });

  }

}