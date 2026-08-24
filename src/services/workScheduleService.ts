import * as workScheduleRepository from '../repositories/workScheduleRepository';

export async function getAllWorkSchedules(companyId: number) {
    return await workScheduleRepository.findAllWorkSchedules(companyId);
}

export async function getWorkScheduleById(
    workScheduleId: number,
    companyId: number,
) {
    const workSchedule =
        await workScheduleRepository.findWorkScheduleById(workScheduleId);
    if (!workSchedule || workSchedule.companyId !== companyId) {
        return null;
    }
    return workSchedule;
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
    companyId: number,
    data: { hoursPerWeek?: number; isPartTime?: boolean },
) {
    const workSchedule =
        await workScheduleRepository.findWorkScheduleById(workScheduleId);
    if (!workSchedule) {
        throw new Error('Radni raspored ne postoji');
    }
    if (workSchedule.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom rasporedu');
    }
    return await workScheduleRepository.updateWorkSchedule(
        workScheduleId,
        data,
    );
}

export async function deleteWorkSchedule(
    workScheduleId: number,
    companyId: number,
) {
    const workSchedule =
        await workScheduleRepository.findWorkScheduleById(workScheduleId);
    if (!workSchedule) {
        throw new Error('Radni raspored ne postoji');
    }
    if (workSchedule.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom rasporedu');
    }
    return await workScheduleRepository.removeWorkSchedule(workScheduleId);
}
