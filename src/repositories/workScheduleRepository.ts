import { WorkSchedule } from '@prisma/client';
import { prisma } from '../config/prismaClient';
import { compact } from '../utils/queryParams';

export async function findAllWorkSchedules(
  companyId: number,
  filters: { userId?: number | undefined },
  pagination: { skip: number; take: number }
) {
  const where = compact({ companyId, userId: filters.userId });
  const [data, total] = await Promise.all([
    prisma.workSchedule.findMany({
      where,
      orderBy: { id: 'asc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.workSchedule.count({ where }),
  ]);
  return { data, total };
}

export async function findWorkScheduleById(workScheduleId: number): Promise<WorkSchedule | null> {
  return await prisma.workSchedule.findUnique({
    where: { id: workScheduleId },
  });
}

export async function createWorkSchedule(data: {
  userId: number;
  companyId: number;
  hoursPerWeek: number;
  isPartTime: boolean;
}): Promise<WorkSchedule> {
  return await prisma.workSchedule.create({ data });
}

export async function updateWorkSchedule(
  workScheduleId: number,
  data: {
    userId?: number;
    companyId?: number;
    hoursPerWeek?: number;
    isPartTime?: boolean;
  }
): Promise<WorkSchedule> {
  return await prisma.workSchedule.update({
    where: { id: workScheduleId },
    data,
  });
}

export async function removeWorkSchedule(workScheduleId: number): Promise<WorkSchedule> {
  return await prisma.workSchedule.delete({ where: { id: workScheduleId } });
}
