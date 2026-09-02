import * as commentRepository from '../repositories/commentRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllComments(companyId: number) {
  return await commentRepository.findAllComments(companyId);
}

export async function getCommentById(commentId: number, companyId: number) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw new NotFoundError('Comment');
  if (comment.companyId !== companyId) throw new ForbiddenError();
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
  data: { leaveRequestId?: number; authorId?: number; text?: string }
) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw new NotFoundError('Comment');
  if (comment.companyId !== companyId) throw new ForbiddenError();
  return await commentRepository.updateComment(commentId, data);
}

export async function deleteComment(commentId: number, companyId: number) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw new NotFoundError('Comment');
  if (comment.companyId !== companyId) throw new ForbiddenError();
  return await commentRepository.removeComment(commentId);
}
