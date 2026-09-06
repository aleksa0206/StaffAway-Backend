import type { Request, Response, NextFunction } from 'express';
import * as companyService from '../services/companyService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllCompaniesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await companyService.getAllCompanies(req.user!.companyId, pagination);
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
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
}
export async function updateMyCompanyHandler(req: Request, res: Response, next: NextFunction) {
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
