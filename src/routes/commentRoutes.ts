import { Router } from "express";
import {
  getAllCommentsHandler,
  getCommentByIdHandler,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "../controllers/commentController";
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createCommentSchema, updateCommentSchema } from '../validation/commentSchemas';

const router = Router();

router.get("/comments", authMiddleware, getAllCommentsHandler);
router.get("/comments/:commentId", authMiddleware, getCommentByIdHandler);
router.post("/comments", authMiddleware, validate(createCommentSchema), createCommentHandler);
router.put("/comments/:commentId", authMiddleware, validate(updateCommentSchema), updateCommentHandler);
router.delete("/comments/:commentId", authMiddleware, deleteCommentHandler);

export default router;