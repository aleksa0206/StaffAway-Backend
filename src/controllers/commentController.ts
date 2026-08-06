import type { Request, Response } from "express";
import * as commentService from "../services/commentService";

export async function getAllCommentsHandler(req: Request, res: Response) {
  try {
    const comment = await commentService.getAllComments();

    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCommentByIdHandler(req: Request, res: Response) {
  try {
    const commentId = Number(req.params.commentId);

    const comment = await commentService.getCommentById(commentId);

    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCommentHandler(req: Request, res: Response) {
  try {
    const { leaveRequestId, authorId, companyId, text } = req.body;
    const comment = await commentService.createComment({
      leaveRequestId,
      authorId,
      companyId,
      text,
    });
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateCommentHandler(req: Request, res: Response) {
  try {
    const commentId = Number(req.params.commentId);
    const { leaveRequestId, authorId, companyId, text } = req.body;
    const comment = await commentService.updateComment(commentId, {
      leaveRequestId,
      authorId,
      companyId,
      text,
    });
    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCommentHandler(req: Request, res: Response) {
  try {
    const commentId = Number(req.params.commentId);
    const comment = await commentService.deleteComment(commentId);
    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
