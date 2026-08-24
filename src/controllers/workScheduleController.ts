import type { Request, Response } from 'express';
import * as workScheduleService from '../services/workScheduleService';

export async function getAllWorkSchedulesHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const workSchedules =
            await workScheduleService.getAllWorkSchedules(companyId);
        res.json(workSchedules);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getWorkScheduleByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const workScheduleId = Number(req.params.workScheduleId);
        const workSchedule = await workScheduleService.getWorkScheduleById(
            workScheduleId,
            companyId,
        );
        res.json(workSchedule);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createWorkScheduleHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const { userId, hoursPerWeek, isPartTime } = req.body;
        const workSchedule = await workScheduleService.createWorkSchedule({
            userId,
            companyId,
            hoursPerWeek,
            isPartTime,
        });
        res.status(201).json(workSchedule);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateWorkScheduleHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const workScheduleId = Number(req.params.workScheduleId);
        const { hoursPerWeek, isPartTime } = req.body;
        const workSchedule = await workScheduleService.updateWorkSchedule(
            workScheduleId,
            companyId,
            {
                hoursPerWeek,
                isPartTime,
            },
        );
        res.json(workSchedule);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}

export async function deleteWorkScheduleHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const workScheduleId = Number(req.params.workScheduleId);
        const workSchedule = await workScheduleService.deleteWorkSchedule(
            workScheduleId,
            companyId,
        );
        res.json(workSchedule);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}
