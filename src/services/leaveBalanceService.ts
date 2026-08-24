import * as leaveBalanceRepository from '../repositories/leaveBalanceRepository';

export async function getAllLeaveBalances(companyId: number) {
    return await leaveBalanceRepository.findAllLeaveBalances(companyId);
}

export async function getLeaveBalanceById(
    leaveBalanceId: number,
    companyId: number,
) {
    const leaveBalance =
        await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
    if (!leaveBalance || leaveBalance.companyId !== companyId) {
        return null;
    }
    return leaveBalance;
}

export async function createLeaveBalance(data: {
    userId: number;
    leaveTypeId: number;
    companyId: number;
    year: number;
    totalDays: number;
    usedDays: number;
}) {
    return await leaveBalanceRepository.createLeaveBalance(data);
}

export async function updateLeaveBalance(
    leaveBalanceId: number,
    companyId: number,
    data: { totalDays?: number; usedDays?: number },
) {
    const leaveBalance =
        await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
    if (!leaveBalance) {
        throw new Error('Balans ne postoji');
    }
    if (leaveBalance.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom balansu');
    }
    return await leaveBalanceRepository.updateLeaveBalance(
        leaveBalanceId,
        data,
    );
}

export async function deleteLeaveBalance(
    leaveBalanceId: number,
    companyId: number,
) {
    const leaveBalance =
        await leaveBalanceRepository.findLeaveBalanceById(leaveBalanceId);
    if (!leaveBalance) {
        throw new Error('Balans ne postoji');
    }
    if (leaveBalance.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom balansu');
    }
    return await leaveBalanceRepository.removeLeaveBalance(leaveBalanceId);
}
