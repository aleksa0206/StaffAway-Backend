import type { Request, Response, NextFunction } from 'express';
import * as statusHistoryService from '../services/statusHistoryService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllStatusHistoriesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await statusHistoryService.getAllStatusHistories(
      req.user!.companyId,
      pagination
    );
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}

export async function getStatusHistoryByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const statusHistoryId = Number(req.params.statusHistoryId);
    const statusHistory = await statusHistoryService.getStatusHistoryById(
      statusHistoryId,
      req.user!.companyId
    );
    res.json(statusHistory);
  } catch (err) {
    next(err);
  }
}
