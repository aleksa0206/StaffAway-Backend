import { Department } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllDepartments(
    companyId: number,
): Promise<Department[]> {
    return await prisma.department.findMany({ where: { companyId } });
}

export async function findDepartmentById(
    id: number,
): Promise<Department | null> {
    return await prisma.department.findUnique({ where: { id } });
}

export async function createDepartment(data: {
    name: string;
    companyId: number;
}): Promise<Department> {
    return await prisma.department.create({ data });
}

export async function updateDepartment(
    id: number,
    data: {
        name?: string;
        companyId?: number;
    },
): Promise<Department> {
    return await prisma.department.update({ where: { id }, data });
}

export async function removeDepartment(id: number): Promise<Department> {
    return await prisma.department.delete({ where: { id } });
}
