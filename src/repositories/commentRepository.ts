import { Comment } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllComments(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.comment.findMany({ where: { companyId }, skip: pagination.skip, take: pagination.take }),
    prisma.comment.count({ where: { companyId } }),
  ]);
  return { data, total };
}

export async function findCommentById(commentId: number): Promise<Comment | null> {
  return await prisma.comment.findUnique({ where: { id: commentId } });
}

export async function createComment(data: {
  leaveRequestId: number;
  authorId: number;
  companyId: number;
  text: string;
}): Promise<Comment> {
  return await prisma.comment.create({ data });
}

export async function updateComment(
  commentId: number,
  data: {
    leaveRequestId?: number;
    authorId?: number;
    companyId?: number;
    text?: string;
  }
): Promise<Comment> {
  return await prisma.comment.update({ where: { id: commentId }, data });
}

export async function removeComment(commentId: number): Promise<Comment> {
  return await prisma.comment.delete({ where: { id: commentId } });
}
