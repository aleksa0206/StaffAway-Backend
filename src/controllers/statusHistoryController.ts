import type { Request, Response } from 'express';
import * as statusHistoryService from '../services/statusHistoryService';

export async function getAllStatusHistoriesHandler(
    req: Request,
    res: Response,
) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const statusHistories =
            await statusHistoryService.getAllStatusHistories(companyId);
        res.json(statusHistories);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStatusHistoryByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const statusHistoryId = Number(req.params.statusHistoryId);
        const statusHistory = await statusHistoryService.getStatusHistoryById(
            statusHistoryId,
            companyId,
        );
        res.json(statusHistory);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createStatusHistoryHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const changedById = req.user.userId;
        const { leaveRequestId, oldStatus, newStatus } = req.body;
        const statusHistory = await statusHistoryService.createStatusHistory({
            leaveRequestId,
            changedById,
            companyId,
            oldStatus,
            newStatus,
        });
        res.status(201).json(statusHistory);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
