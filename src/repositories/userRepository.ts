import { User } from '@prisma/client';
import { prisma } from '../config/prismaClient';

const userSafeSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  managerId: true,
  departmentId: true,
  companyId: true,
  hireDate: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findAll(companyId: number) {
  return await prisma.user.findMany({ where: { companyId }, select: userSafeSelect });
}

export async function findById(userId: number) {
  return await prisma.user.findUnique({ where: { id: userId }, select: userSafeSelect });
}

export async function create(data: {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'Employee' | 'Manager' | 'Hr';
  managerId: number | null;
  hireDate: Date;
  companyId: number;
}) {
  return await prisma.user.create({ data, select: userSafeSelect });
}

export async function update(
  userId: number,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    role: 'Employee' | 'Manager' | 'Hr';
    managerId: number | null;
    departmentId: number | null;
    hireDate: Date;
  }>
) {
  return await prisma.user.update({ where: { id: userId }, data, select: userSafeSelect });
}

export async function remove(userId: number) {
  return await prisma.user.delete({ where: { id: userId }, select: userSafeSelect });
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findFirst({ where: { email } });
}