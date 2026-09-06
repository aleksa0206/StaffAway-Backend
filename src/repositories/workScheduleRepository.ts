import { WorkSchedule } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllWorkSchedules(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.workSchedule.findMany({
      where: { companyId },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.workSchedule.count({ where: { companyId } }),
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
