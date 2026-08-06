import type { Request, Response } from "express";
import * as companyService from "../services/companyService";

export async function getAllCompaniesHandler(req: Request, res: Response) {
  try {
    const company = await companyService.getAllCompanies();

    res.json(company);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCompanyByIdHandler(req: Request, res: Response) {
  try {
    const companyId = Number(req.params.companyId);

    const company = await companyService.getCompanyById(companyId);

    res.json(company);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCompanyHandler(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const company = await companyService.createCompany({
      name,
    });
    res.status(201).json(company);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateCompanyHandler(req: Request, res: Response) {
  try {
    const companyId = Number(req.params.companyId);
    const { name } = req.body;
    const company = await companyService.updateCompany(companyId, {
      name,
    });
    res.json(company);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCompanyHandler(req: Request, res: Response) {
  try {
    const companyId = Number(req.params.companyId);
    const company = await companyService.deleteCompany(companyId);
    res.json(company);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
