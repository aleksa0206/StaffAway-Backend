import { Holiday } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllHolidays(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  const [data, total] = await Promise.all([
    prisma.holiday.findMany({ where: { companyId }, skip: pagination.skip, take: pagination.take }),
    prisma.holiday.count({ where: { companyId } }),
  ]);
  return { data, total };
}

export async function findHolidayById(holidayId: number): Promise<Holiday | null> {
  return await prisma.holiday.findUnique({ where: { id: holidayId } });
}

export async function createHoliday(data: {
  name: string;
  companyId: number;
  isRecurring: boolean;
  date: Date;
}): Promise<Holiday> {
  return await prisma.holiday.create({ data });
}

export async function updateHoliday(
  holidayId: number,
  data: {
    name?: string;
    companyId?: number;
    isRecurring?: boolean;
    date?: Date;
  }
): Promise<Holiday> {
  return await prisma.holiday.update({ where: { id: holidayId }, data });
}

export async function removeHoliday(holidayId: number): Promise<Holiday> {
  return await prisma.holiday.delete({ where: { id: holidayId } });
}
