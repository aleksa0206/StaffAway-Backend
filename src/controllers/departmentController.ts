import type { Request, Response } from "express";
import * as departmentService from "../services/departmentService";

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
    const departmentId = Number(req.params.departmentId);

    const department = await departmentService.getDepartmentById(departmentId);

    res.json(department);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createDepartmentHandler(req: Request, res: Response) {
  try {
    const { name, companyId } = req.body;
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
    const departmentId = Number(req.params.departmentId);
    const { name, companyId } = req.body;
    const updateDepartment = await departmentService.updateDepartment(
      departmentId,
      { name, companyId },
    );
    res.json(updateDepartment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteDepartmentHandler(req: Request, res: Response) {
  try {
    const departmentId = Number(req.params.departmentId);
    const deleteDepartment =
      await departmentService.deleteDepartment(departmentId);
    res.json(deleteDepartment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
