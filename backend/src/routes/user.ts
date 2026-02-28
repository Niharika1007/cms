import express from "express";
import { verifyToken } from "../utils/jwt";

const router = express.Router();

router.get("/me", (req, res) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ error: "No token" });

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    res.json({
      message: "Access granted",
      user: decoded
    });

  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;