import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/db";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/jwt";

const router = express.Router();


// ==========================
// REGISTER
// ==========================
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required"
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "AUTHOR"
      }
    });

    res.json({
      message: "User registered",
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      error: "Registration failed"
    });
  }
});


// ==========================
// LOGIN
// ==========================
router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid password"
      });
    }

    // generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      role: user.role
    });

    // save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken
      }
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      error: "Login failed"
    });
  }
});


// ==========================
// REFRESH TOKEN
// ==========================
router.post("/refresh", async (req, res) => {
  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: "Refresh token required"
      });
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        error: "Invalid refresh token"
      });
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    res.json({
      accessToken: newAccessToken
    });

  } catch (error) {
    res.status(403).json({
      error: "Invalid refresh token"
    });
  }
});


// ==========================
// LOGOUT
// ==========================
router.post("/logout", async (req, res) => {
  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token required"
      });
    }

    const payload = verifyRefreshToken(refreshToken);

    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        refreshToken: null
      }
    });

    res.json({
      message: "Logged out successfully"
    });

  } catch {
    res.status(400).json({
      error: "Logout failed"
    });
  }
});


export default router;