import * as commentRepository from "../repositories/commentRepository";

export async function getAllComments() {
  return await commentRepository.findAllComments();
}

export async function getCommentById(commentId: number) {
  return await commentRepository.findCommentById(commentId);
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
  data: {
    leaveRequestId?: number;
    authorId?: number;
    companyId?: number;
    text?: string;
  },
) {
  return await commentRepository.updateComment(commentId, data);
}

export async function deleteComment(commentId: number) {
  return await commentRepository.removeComment(commentId);
}
