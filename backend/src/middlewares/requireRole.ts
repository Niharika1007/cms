import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export function requireRole(...allowedRoles: string[]) {

  return (req: Request, res: Response, next: NextFunction) => {

    try {

      const authHeader = req.headers.authorization;

      if (!authHeader)
        return res.status(401).json({ error: "No token" });

      const token = authHeader.split(" ")[1];

      const decoded = verifyToken(token);

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          error: "Forbidden: insufficient permissions"
        });
      }

      (req as any).user = decoded;

      next();

    } catch {
      res.status(401).json({ error: "Invalid token" });
    }

  };

}