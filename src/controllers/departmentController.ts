import type { Request, Response, NextFunction } from 'express';
import * as departmentService from '../services/departmentService';

export async function getAllDepartmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await departmentService.getAllDepartments(req.user!.companyId);
    res.json(departments);
  } catch (err) {
    next(err);
  }
}

export async function getDepartmentByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const departmentId = Number(req.params.departmentId);
    const department = await departmentService.getDepartmentById(departmentId, req.user!.companyId);
    res.json(department);
  } catch (err) {
    next(err);
  }
}

export async function createDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const newDepartment = await departmentService.createDepartment({
      name,
      companyId: req.user!.companyId,
    });
    res.status(201).json(newDepartment);
  } catch (err) {
    next(err);
  }
}

export async function updateDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const departmentId = Number(req.params.departmentId);
    const { name } = req.body;
    const updatedDepartment = await departmentService.updateDepartment(
      departmentId,
      req.user!.companyId,
      { name }
    );
    res.json(updatedDepartment);
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const departmentId = Number(req.params.departmentId);
    const deletedDepartment = await departmentService.deleteDepartment(departmentId, req.user!.companyId);
    res.json(deletedDepartment);
  } catch (err) {
    next(err);
  }
}