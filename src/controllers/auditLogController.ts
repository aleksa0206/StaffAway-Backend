import type { Request, Response } from 'express';
import * as auditLogService from '../services/auditLogService';

export async function getAllAuditLogsHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const auditLogs = await auditLogService.getAllAuditLogs(companyId);
        res.json(auditLogs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getAuditLogByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const auditLogId = Number(req.params.auditLogId);
        const auditLog = await auditLogService.getAuditLogById(
            auditLogId,
            companyId,
        );
        res.json(auditLog);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createAuditLogHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const companyId = req.user.companyId;
        const performedById = req.user.userId;
        const { entityType, entityId, action, oldValue, newValue } = req.body;
        const auditLog = await auditLogService.createAuditLog({
            entityType,
            entityId,
            action,
            performedById,
            companyId,
            oldValue,
            newValue,
        });
        res.status(201).json(auditLog);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
