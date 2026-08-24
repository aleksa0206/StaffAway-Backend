import type { Request, Response } from 'express';
import * as leaveTypeService from '../services/leaveTypeService';

export async function getAllLeaveTypesHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;

        const leaveTypes = await leaveTypeService.getAllLeaveTypes(companyId);

        res.json(leaveTypes);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getLeaveTypeByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const leaveTypeId = Number(req.params.leaveTypeId);

        const leaveType = await leaveTypeService.getLeaveTypeById(
            leaveTypeId,
            companyId,
        );

        res.json(leaveType);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createLeaveTypeHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const { name, requiresApproval, countsTowardBalance } = req.body;

        const newLeaveType = await leaveTypeService.createLeaveType({
            name,
            requiresApproval,
            countsTowardBalance,
            companyId,
        });
        res.status(201).json(newLeaveType);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateLeaveTypeHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const leaveTypeId = Number(req.params.leaveTypeId);
        const { name, requiresApproval, countsTowardBalance } = req.body;

        const updated = await leaveTypeService.updateLeaveType(
            leaveTypeId,
            companyId,
            {
                name,
                requiresApproval,
                countsTowardBalance,
            },
        );
        res.json(updated);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}

export async function deleteLeaveTypeHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        
        const companyId = req.user.companyId;
        const leaveTypeId = Number(req.params.leaveTypeId);

        const deleted = await leaveTypeService.deleteLeaveType(
            leaveTypeId,
            companyId,
        );
        res.json(deleted);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}
