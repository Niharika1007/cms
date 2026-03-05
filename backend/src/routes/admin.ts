import express from "express";
import { prisma } from "../config/db";
import { requireRole } from "../middlewares/requireRole";

const router = express.Router();


// Change user role (ADMIN only)

router.put(
  "/change-role",
  requireRole("ADMIN"),
  async (req, res) => {

    try {

      const { userId, role } = req.body;

      if (!userId || !role) {
        return res.status(400).json({
          error: "userId and role required"
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role }
      });

      res.json({
        message: "Role updated successfully",
        user: updatedUser
      });

    } catch (err) {
      res.status(500).json({
        error: "Failed to update role"
      });
    }

  }
);

export default router;