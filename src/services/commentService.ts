import * as commentRepository from '../repositories/commentRepository';
import * as leaveRequestRepository from '../repositories/leaveRequestRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

type Viewer = { userId: number; role: string };

// Comments discuss a specific request, so an Employee only sees those on their own requests;
// managers and Hr see all of them in the company.
function ownerFilterFor(viewer: Viewer): number | undefined {
  return viewer.role === 'Employee' ? viewer.userId : undefined;
}

export async function getAllComments(
  companyId: number,
  filters: { leaveRequestId?: number | undefined },
  pagination: { skip: number; take: number },
  viewer: Viewer
) {
  return await commentRepository.findAllComments(
    companyId,
    { ...filters, ownerUserId: ownerFilterFor(viewer) },
    pagination
  );
}

export async function getCommentById(commentId: number, companyId: number, viewer: Viewer) {
  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) throw new NotFoundError('Comment');
  if (comment.companyId !== companyId) throw new ForbiddenError();
  const ownerUserId = ownerFilterFor(viewer);
  if (ownerUserId !== undefined) {
    const leaveRequest = await leaveRequestRepository.findLeaveRequestById(comment.leaveRequestId);
    if (leaveRequest?.userId !== ownerUserId) throw new ForbiddenError();
  }
  return comment;
}

export async function createComment(
  data: {
    leaveRequestId: number;
    authorId: number;
    companyId: number;
    text: string;
  },
  authorRole: string
) {
  const leaveRequest = await leaveRequestRepository.findLeaveRequestById(data.leaveRequestId);
  if (!leaveRequest) throw new NotFoundError('LeaveRequest');
  if (leaveRequest.companyId !== data.companyId) throw new ForbiddenError();

  const isManagerOrHr = authorRole === 'Manager' || authorRole === 'Hr';
  if (!isManagerOrHr && leaveRequest.userId !== data.authorId) {
    throw new ForbiddenError('You can only comment on your own leave requests');
  }

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
