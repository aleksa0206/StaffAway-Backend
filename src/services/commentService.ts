import * as commentRepository from '../repositories/commentRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllComments(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  return await commentRepository.findAllComments(companyId, pagination);
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

function assertCommentOwnerOrPrivileged(
  comment: { authorId: number },
  requestingUserId: number,
  requestingUserRole: string
) {
  const isOwner = comment.authorId === requestingUserId;
  const isManagerOrHr = requestingUserRole === 'Manager' || requestingUserRole === 'Hr';
  if (!isOwner && !isManagerOrHr) {
    throw new ForbiddenError('You can only modify your own comments');
  }
}

export async function updateComment(
  commentId: number,
  companyId: number,
  requestingUserId: number,
  requestingUserRole: string,
  data: { text?: string }
) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw new NotFoundError('Comment');
  if (comment.companyId !== companyId) throw new ForbiddenError();
  assertCommentOwnerOrPrivileged(comment, requestingUserId, requestingUserRole);
  return await commentRepository.updateComment(commentId, data);
}

export async function deleteComment(
  commentId: number,
  companyId: number,
  requestingUserId: number,
  requestingUserRole: string
) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw new NotFoundError('Comment');
  if (comment.companyId !== companyId) throw new ForbiddenError();
  assertCommentOwnerOrPrivileged(comment, requestingUserId, requestingUserRole);
  return await commentRepository.removeComment(commentId);
}
