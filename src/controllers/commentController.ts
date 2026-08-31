import type { Request, Response } from 'express';
import * as commentService from '../services/commentService';
import { handleControllerError } from '../errors/handleControllerError';
import { notFound } from '../errors/AppError';

export async function getAllCommentsHandler(req: Request, res: Response) {
  try {
    const comments = await commentService.getAllComments(req.user!.companyId);
    res.json(comments);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function getCommentByIdHandler(req: Request, res: Response) {
  try {
    const commentId = Number(req.params.commentId);
    const comment = await commentService.getCommentById(commentId, req.user!.companyId);
    res.json(comment);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function createCommentHandler(req: Request, res: Response) {
  try {
    const { leaveRequestId, text } = req.body;
    const comment = await commentService.createComment({
      leaveRequestId,
      authorId: req.user!.userId,
      companyId: req.user!.companyId,
      text,
    });
    res.status(201).json(comment);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function updateCommentHandler(req: Request, res: Response) {
  try {
    const commentId = Number(req.params.commentId);
    const { text } = req.body;
    const comment = await commentService.updateComment(commentId, req.user!.companyId, { text });
    res.json(comment);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function deleteCommentHandler(req: Request, res: Response) {
  try {
    const commentId = Number(req.params.commentId);
    const comment = await commentService.deleteComment(commentId, req.user!.companyId);
    res.json(comment);
  } catch (err) {
    handleControllerError(err, res);
  }
}