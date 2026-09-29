import { prisma } from '../config/prismaClient';
import { compact } from '../utils/queryParams';

const commentInclude = {
  author: { select: { id: true, firstName: true, lastName: true } },
} as const;

export async function findAllComments(
  companyId: number,
  filters: { leaveRequestId?: number | undefined; ownerUserId?: number | undefined },
  pagination: { skip: number; take: number }
) {
  const where = compact({
    companyId,
    leaveRequestId: filters.leaveRequestId,
    leaveRequest: filters.ownerUserId !== undefined ? { userId: filters.ownerUserId } : undefined,
  });
  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: commentInclude,
      orderBy: { createdAt: 'asc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.comment.count({ where }),
  ]);
  return { data, total };
}

export async function findCommentById(commentId: number) {
  return await prisma.comment.findUnique({ where: { id: commentId }, include: commentInclude });
}

export async function createComment(data: {
  leaveRequestId: number;
  authorId: number;
  companyId: number;
  text: string;
}) {
  return await prisma.comment.create({ data, include: commentInclude });
}

export async function updateComment(commentId: number, data: { text?: string }) {
  return await prisma.comment.update({
    where: { id: commentId },
    data,
    include: commentInclude,
  });
}

export async function removeComment(commentId: number) {
  return await prisma.comment.delete({ where: { id: commentId } });
}
