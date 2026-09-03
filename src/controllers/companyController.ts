import type { Request, Response, NextFunction } from 'express';
import * as companyService from '../services/companyService';

export async function getAllCompaniesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const companies = await companyService.getAllCompanies(req.user!.companyId);
    res.json(companies);
  } catch (err) {
    next(err);
  }
}

export async function getMyCompanyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const company = await companyService.getOwnCompany(req.user!.companyId);
    res.json(company);
  } catch (err) {
    next(err);
  }
}

export async function createCompanyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const company = await companyService.createCompany({ name }, req.user!.companyId);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
}export async function updateMyCompanyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const company = await companyService.updateOwnCompany(
      req.user!.companyId,
      { name },
      req.user!.role,
      req.user!.userId
    );
    res.json(company);
  } catch (err) {
    next(err);
  }
}

export async function deleteMyCompanyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const company = await companyService.deleteOwnCompany(
      req.user!.companyId,
      req.user!.role,
      req.user!.userId
    );
    res.json(company);
  } catch (err) {
    next(err);
  }
}
