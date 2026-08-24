import { Router } from "express";
import {
  getAllCommentsHandler,
  getCommentByIdHandler,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "../controllers/commentController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get("/comments",authMiddleware, getAllCommentsHandler);
router.get("/comments/:commentId",authMiddleware, getCommentByIdHandler);
router.post("/comments", authMiddleware, createCommentHandler);
router.put("/comments/:commentId",authMiddleware,  updateCommentHandler);
router.delete("/comments/:commentId",authMiddleware, deleteCommentHandler);

export default router;