import { Holiday } from '@prisma/client';
import { prisma } from '../config/prismaClient';

export async function findAllHolidays(companyId: number): Promise<Holiday[]> {
    return await prisma.holiday.findMany({ where: { companyId } });
}

export async function findHolidayById(
    holidayId: number,
): Promise<Holiday | null> {
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
    },
): Promise<Holiday> {
    return await prisma.holiday.update({ where: { id: holidayId }, data });
}

export async function removeHoliday(holidayId: number): Promise<Holiday> {
    return await prisma.holiday.delete({ where: { id: holidayId } });
}
