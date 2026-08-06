import * as holidayRepository from "../repositories/holidayRepository";

export async function getAllHolidays() {
  return await holidayRepository.findAllHolidays();
}

export async function getHolidayById(holidayId: number) {
  return await holidayRepository.findHolidayById(holidayId);
}

export async function createHoliday(data: {
  name: string;
  companyId: number;
  isRecurring: boolean;
  date: Date;
}) {
  return await holidayRepository.createHoliday(data);
}

export async function updateHoliday(
  holidayId: number,
  data: {
    name?: string;
    companyId?: number;
    isRecurring?: boolean;
    date?: Date;
  },
) {
  return await holidayRepository.updateHoliday(holidayId, data);
}

export async function deleteHoliday(holidayId: number) {
  return await holidayRepository.removeHoliday(holidayId);
}
