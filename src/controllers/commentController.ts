import type { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllCommentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await commentService.getAllComments(req.user!.companyId, pagination);
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}
export async function getCommentByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const commentId = Number(req.params.commentId);
    const comment = await commentService.getCommentById(commentId, req.user!.companyId);
    res.json(comment);
  } catch (err) {
    next(err);
  }
}

export async function createCommentHandler(req: Request, res: Response, next: NextFunction) {
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
    next(err);
  }
}

export async function updateCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const commentId = Number(req.params.commentId);
    const { text } = req.body;
    const comment = await commentService.updateComment(commentId, req.user!.companyId, { text });
    res.json(comment);
  } catch (err) {
    next(err);
  }
}

export async function deleteCommentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const commentId = Number(req.params.commentId);
    const comment = await commentService.deleteComment(commentId, req.user!.companyId);
    res.json(comment);
  } catch (err) {
    next(err);
  }
}
