import { Department } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAll(): Promise<Department[]> {
    return await prisma.department.findMany();
}

export async function findById(id: number): Promise<Department | null> {
    return await prisma.department.findUnique({ where: { id } });
}

export async function create(data: {
    name: string;
    companyId: number;
}): Promise<Department> {
    return await prisma.department.create({ data });
}

export async function update(
    id: number,
    data: {
        name?: string;
        companyId?: number;
    },
): Promise<Department> {
    return await prisma.department.update({ where: { id }, data });
}

export async function remove(id: number): Promise<Department> {
    return await prisma.department.delete({ where: { id } });
}
