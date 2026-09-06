import * as holidayRepository from '../repositories/holidayRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllHolidays(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  return await holidayRepository.findAllHolidays(companyId, pagination);
}

export async function getHolidayById(holidayId: number, companyId: number) {
  const holiday = await holidayRepository.findHolidayById(holidayId);

  if (!holiday) throw new NotFoundError('Holiday');
  if (holiday.companyId !== companyId) throw new ForbiddenError();

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
  data: { name?: string; date?: Date; isRecurring?: boolean }
) {
  const holiday = await holidayRepository.findHolidayById(holidayId);

  if (!holiday) throw new NotFoundError('Holiday');
  if (holiday.companyId !== companyId) throw new ForbiddenError();

  return await holidayRepository.updateHoliday(holidayId, data);
}

export async function deleteHoliday(holidayId: number, companyId: number) {
  const holiday = await holidayRepository.findHolidayById(holidayId);

  if (!holiday) throw new NotFoundError('Holiday');
  if (holiday.companyId !== companyId) throw new ForbiddenError();

  return await holidayRepository.removeHoliday(holidayId);
}
