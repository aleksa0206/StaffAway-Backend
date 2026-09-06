import * as workScheduleRepository from '../repositories/workScheduleRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import * as userRepository from '../repositories/userRepository';

export async function getAllWorkSchedules(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  return await workScheduleRepository.findAllWorkSchedules(companyId, pagination);
}

export async function getWorkScheduleById(workScheduleId: number, companyId: number) {
  const workSchedule = await workScheduleRepository.findWorkScheduleById(workScheduleId);

  if (!workSchedule) throw new NotFoundError('WorkSchedule');
  if (workSchedule.companyId !== companyId) throw new ForbiddenError();

  return workSchedule;
}
export async function createWorkSchedule(data: {
  userId: number;
  companyId: number;
  hoursPerWeek: number;
  isPartTime: boolean;
}) {
  const targetUser = await userRepository.findById(data.userId);
  if (!targetUser) {
    throw new NotFoundError('User');
  }
  if (targetUser.companyId !== data.companyId) {
    throw new ForbiddenError('Cannot create work schedule for a user outside your company');
  }

  return await workScheduleRepository.createWorkSchedule(data);
}

export async function updateWorkSchedule(
  workScheduleId: number,
  companyId: number,
  data: { hoursPerWeek?: number; isPartTime?: boolean }
) {
  const workSchedule = await workScheduleRepository.findWorkScheduleById(workScheduleId);

  if (!workSchedule) throw new NotFoundError('WorkSchedule');
  if (workSchedule.companyId !== companyId) throw new ForbiddenError();

  return await workScheduleRepository.updateWorkSchedule(workScheduleId, data);
}

export async function deleteWorkSchedule(workScheduleId: number, companyId: number) {
  const workSchedule = await workScheduleRepository.findWorkScheduleById(workScheduleId);

  if (!workSchedule) throw new NotFoundError('WorkSchedule');
  if (workSchedule.companyId !== companyId) throw new ForbiddenError();

  return await workScheduleRepository.removeWorkSchedule(workScheduleId);
}
