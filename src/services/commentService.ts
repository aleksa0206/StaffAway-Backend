import * as commentRepository from '../repositories/commentRepository';
import { notFound, forbidden } from '../errors/AppError';

export async function getAllComments(companyId: number) {
  return await commentRepository.findAllComments(companyId);
}

export async function getCommentById(commentId: number, companyId: number) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw notFound('Comment');
  if (comment.companyId !== companyId) throw forbidden();
  return comment;
}

export async function createComment(data: {
  leaveRequestId: number;
  authorId: number;
  companyId: number;
  text: string;
}) {
  return await commentRepository.createComment(data);
}

export async function updateComment(
  commentId: number,
  companyId: number,
  data: {
    leaveRequestId?: number;
    authorId?: number;
    text?: string;
  }
) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw notFound('Comment');
  if (comment.companyId !== companyId) throw forbidden();

  return await commentRepository.updateComment(commentId, data);
}

export async function deleteComment(commentId: number, companyId: number) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw notFound('Comment');
  if (comment.companyId !== companyId) throw forbidden();

  return await commentRepository.removeComment(commentId);
}