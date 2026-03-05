import { Router } from "express";

import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController";

import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();

/* CREATE POST */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "EDITOR"]),
  createPost
);

/* GET ALL POSTS */
router.get("/", getPosts);

/* GET POST BY ID */
router.get("/:id", getPostById);

/* UPDATE POST */
router.put("/:id", authMiddleware, updatePost);

/* DELETE POST */
router.delete("/:id", authMiddleware, deletePost);

export default router;