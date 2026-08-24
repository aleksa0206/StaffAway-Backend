import * as leaveTypeRepository from '../repositories/leaveTypeRepository';

export async function getAllLeaveTypes(companyId: number) {
    return await leaveTypeRepository.findAllLeaveTypes(companyId);
}

export async function getLeaveTypeById(leaveTypeId: number, companyId: number) {
    const leaveType = await leaveTypeRepository.findLeaveTypeById(leaveTypeId);

    if (!leaveType || leaveType.companyId !== companyId) {
        return null;
    }

    return leaveType;
}

export async function createLeaveType(data: {
    name: string;
    requiresApproval: boolean;
    countsTowardBalance: boolean;
    companyId: number;
}) {
    return await leaveTypeRepository.createLeaveType(data);
}

export async function updateLeaveType(
    leaveTypeId: number,
    companyId: number,
    data: {
        name?: string;
        requiresApproval?: boolean;
        countsTowardBalance?: boolean;
    },
) {
    const leaveType = await leaveTypeRepository.findLeaveTypeById(leaveTypeId);

    if (!leaveType) {
        throw new Error('Tip odsustva ne postoji');
    }

    if (leaveType.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom tipu odsustva');
    }

    return await leaveTypeRepository.updateLeaveType(leaveTypeId, data);
}

export async function deleteLeaveType(leaveTypeId: number, companyId: number) {
    const leaveType = await leaveTypeRepository.findLeaveTypeById(leaveTypeId);

    if (!leaveType) {
        throw new Error('Tip odsustva ne postoji');
    }

    if (leaveType.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom tipu odsustva');
    }

    return await leaveTypeRepository.removeLeaveType(leaveTypeId);
}
