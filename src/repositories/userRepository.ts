import { User } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAll(): Promise<User[]> {
    return await prisma.user.findMany();
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
    return await prisma.user.create({ data });
}
