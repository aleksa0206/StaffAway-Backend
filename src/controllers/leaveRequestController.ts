import type { Request, Response } from 'express';
import * as leaveBalanceService from '../services/leaveBalanceService';

export async function getAllLeaveBalancesHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const leaveBalances =
            await leaveBalanceService.getAllLeaveBalances(companyId);
        res.json(leaveBalances);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getLeaveBalanceByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const leaveBalanceId = Number(req.params.leaveBalanceId);
        const leaveBalance = await leaveBalanceService.getLeaveBalanceById(
            leaveBalanceId,
            companyId,
        );
        res.json(leaveBalance);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createLeaveBalanceHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const { userId, leaveTypeId, year, totalDays, usedDays } = req.body;
        const leaveBalance = await leaveBalanceService.createLeaveBalance({
            userId,
            leaveTypeId,
            companyId,
            year,
            totalDays,
            usedDays,
        });
        res.status(201).json(leaveBalance);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateLeaveBalanceHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const leaveBalanceId = Number(req.params.leaveBalanceId);
        const { totalDays, usedDays } = req.body;
        const leaveBalance = await leaveBalanceService.updateLeaveBalance(
            leaveBalanceId,
            companyId,
            {
                totalDays,
                usedDays,
            },
        );
        res.json(leaveBalance);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}

export async function deleteLeaveBalanceHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const leaveBalanceId = Number(req.params.leaveBalanceId);
        const leaveBalance = await leaveBalanceService.deleteLeaveBalance(
            leaveBalanceId,
            companyId,
        );
        res.json(leaveBalance);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}
