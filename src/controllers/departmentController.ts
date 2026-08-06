import type { Request, Response } from 'express';
import * as departmentService from '../services/departmentService';

export async function getAllDepartmentsHandler(req: Request, res: Response) {
    try {
        const departments = await departmentService.getAllDepartments();

        res.json(departments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getDepartmentByIdHandler(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        const department = await departmentService.getDepartmentById(id);

        res.json(department);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createDepartmentHandler(req: Request, res: Response) {}

export async function updateDepartmentHandler(req: Request, res: Response) {}

export async function deleteDepartmentHandler(req: Request, res: Response) {}
