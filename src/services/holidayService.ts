import * as holidayRepository from '../repositories/holidayRepository';

export async function getAllHolidays(companyId: number) {
    return await holidayRepository.findAllHolidays(companyId);
}

export async function getHolidayById(holidayId: number, companyId: number) {
    const holiday = await holidayRepository.findHolidayById(holidayId);
    if (!holiday || holiday.companyId !== companyId) {
        return null;
    }
    return holiday;
}

export async function createHoliday(data: {
    name: string;
    date: Date;
    isRecurring: boolean;
    companyId: number;
}) {
    return await holidayRepository.createHoliday(data);
}

export async function updateHoliday(
    holidayId: number,
    companyId: number,
    data: { name?: string; date?: Date; isRecurring?: boolean },
) {
    const holiday = await holidayRepository.findHolidayById(holidayId);
    if (!holiday) {
        throw new Error('Praznik ne postoji');
    }
    if (holiday.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom prazniku');
    }
    return await holidayRepository.updateHoliday(holidayId, data);
}

export async function deleteHoliday(holidayId: number, companyId: number) {
    const holiday = await holidayRepository.findHolidayById(holidayId);
    if (!holiday) {
        throw new Error('Praznik ne postoji');
    }
    if (holiday.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom prazniku');
    }
    return await holidayRepository.removeHoliday(holidayId);
}
