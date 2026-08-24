import type { Request, Response } from 'express';
import * as holidayService from '../services/holidayService';

export async function getAllHolidaysHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }

        const companyId = req.user.companyId;

        const holiday = await holidayService.getAllHolidays(companyId);

        res.json(holiday);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getHolidayByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }

        const holidayId = Number(req.params.holidayId);
        const companyId = req.user.companyId;

        const holiday = await holidayService.getHolidayById(
            holidayId,
            companyId,
        );

        res.json(holiday);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createHolidayHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }

        const companyId = req.user.companyId;

        const { name, isRecurring, date } = req.body;

        const holiday = await holidayService.createHoliday({
            name,
            companyId,
            isRecurring,
            date: new Date(date),
        });
        res.status(201).json(holiday);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateHolidayHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }

        const companyId = req.user.companyId;

        const holidayId = Number(req.params.holidayId);
        const { name, isRecurring, date } = req.body;
        const holiday = await holidayService.updateHoliday(
            holidayId,
            companyId,
            {
                name,
                isRecurring,
                date,
            },
        );
        res.json(holiday);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteHolidayHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }

        const companyId = req.user?.companyId;

        const holidayId = Number(req.params.holidayId);
        const holiday = await holidayService.deleteHoliday(
            holidayId,
            companyId,
        );
        res.json(holiday);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
