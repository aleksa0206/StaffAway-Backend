import { Router } from "express";
import {
  getAllCommentsHandler,
  getCommentByIdHandler,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "../controllers/commentController";

const router = Router();

router.get("/comments", getAllCommentsHandler);
router.get("/comments/:commentId", getCommentByIdHandler);
router.post("/comments", createCommentHandler);
router.put("/comments/:commentId", updateCommentHandler);
router.delete("/comments/:commentId", deleteCommentHandler);

export default router;