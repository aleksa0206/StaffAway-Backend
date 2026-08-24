import type { Request, Response } from 'express';
import * as departmentService from '../services/departmentService';

export async function getAllDepartmentsHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikaovani' });
        }
        const companyId = req.user.companyId;

        const departments =
            await departmentService.getAllDepartments(companyId);

        res.json(departments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getDepartmentByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }

        const companyId = req.user.companyId;
        const departmentId = Number(req.params.departmentId);

        const department = await departmentService.getDepartmentById(
            departmentId,
            companyId,
        );

        res.json(department);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}

export async function createDepartmentHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }

        const companyId = req.user?.companyId;
        const { name } = req.body;

        const newDepartment = await departmentService.createDepartment({
            name,
            companyId,
        });
        res.status(201).json(newDepartment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
export async function updateDepartmentHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const departmentId = Number(req.params.departmentId);
        const companyId = req.user.companyId;
        const { name } = req.body;

        const updatedDepartment = await departmentService.updateDepartment(
            departmentId,
            companyId,
            { name },
        );
        res.json(updatedDepartment);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}

export async function deleteDepartmentHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }

        const departmentId = Number(req.params.departmentId);
        const companyId = req.user?.companyId;

        const deleteDepartment = await departmentService.deleteDepartment(
            departmentId,
            companyId,
        );
        res.json(deleteDepartment);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}
