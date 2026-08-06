import * as workScheduleRepository from "../repositories/workScheduleRepository";

export async function getAllWorkSchedules() {
  return await workScheduleRepository.findAllWorkSchedules();
}

export async function getWorkScheduleById(workScheduleId: number) {
  return await workScheduleRepository.findWorkScheduleById(workScheduleId);
}

export async function createWorkSchedule(data: {
  userId: number;
  companyId: number;
  hoursPerWeek: number;
  isPartTime: boolean;
}) {
  return await workScheduleRepository.createWorkSchedule(data);
}

export async function updateWorkSchedule(
  workScheduleId: number,
  data: {
    userId?: number;
    companyId?: number;
    hoursPerWeek?: number;
    isPartTime?: boolean;
  },
) {
  return await workScheduleRepository.updateWorkSchedule(workScheduleId, data);
}

export async function deleteWorkSchedule(workScheduleId: number) {
  return await workScheduleRepository.removeWorkSchedule(workScheduleId);
}
