import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/db";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
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

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "AUTHOR"
      }
    });

    res.json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {

    console.error(error);

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

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid password"
      });
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      role: user.role
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshToken
      }
    });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Login failed"
    });

  }
});


// ==========================
// REFRESH ACCESS TOKEN
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

    console.error(error);

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

  } catch (error) {

    console.error(error);

    res.status(400).json({
      error: "Logout failed"
    });

  }
});


// ==========================
// ADMIN ROUTE (PROTECTED)
// ==========================
router.get("/admin", async (req, res) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    if (payload.role !== "ADMIN") {
      return res.status(403).json({
        error: "Forbidden: Admin only"
      });
    }

    res.json({
      message: "Welcome Admin",
      user: payload
    });

  } catch (error) {

    console.error(error);

    res.status(401).json({
      error: "Invalid token"
    });

  }
});


export default router;