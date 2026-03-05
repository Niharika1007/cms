import { Request, Response } from "express";
import { prisma } from "../utils/prismaClient";
import { AuthRequest } from "../middlewares/authMiddleware";
import slugify from "slugify";

/* ---------------- CREATE POST ---------------- */

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content required",
      });
    }

    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        authorId: req.user.id,
      },
    });

    res.status(201).json(post);

  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/* ---------------- GET ALL POSTS ---------------- */

export const getPosts = async (req: Request, res: Response) => {
  try {

    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json(posts);

  } catch (error: any) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/* ---------------- GET POST BY ID ---------------- */

export const getPostById = async (req: Request, res: Response) => {
  try {

    const  id  = req.params.id as string;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(post);

  } catch (error: any) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/* ---------------- UPDATE POST ---------------- */

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {

    const  id  = req.params.id as string;
    const { title, content } = req.body;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    res.json(updated);

  } catch (error: any) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

/* ---------------- DELETE POST ---------------- */

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {

    const  id  = req.params.id as string;

    await prisma.post.delete({
      where: { id },
    });

    res.json({
      message: "Post deleted successfully",
    });

  } catch (error: any) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};