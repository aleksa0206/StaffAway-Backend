import type { Request, Response, NextFunction } from 'express';
import * as apiKeyService from '../services/apiKeyService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllApiKeysHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await apiKeyService.getAllApiKeys(req.user!.companyId, pagination);
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}

export async function getApiKeyByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKeyId = Number(req.params.apiKeyId);
    const apiKey = await apiKeyService.getApiKeyById(apiKeyId, req.user!.companyId);
    res.json(apiKey);
  } catch (err) {
    next(err);
  }
}

export async function createApiKeyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { key, name } = req.body;
    const apiKey = await apiKeyService.createApiKey({ key, name, companyId: req.user!.companyId });
    res.status(201).json(apiKey);
  } catch (err) {
    next(err);
  }
}

export async function revokeApiKeyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKeyId = Number(req.params.apiKeyId);
    const apiKey = await apiKeyService.revokeApiKey(apiKeyId, req.user!.companyId);
    res.json(apiKey);
  } catch (err) {
    next(err);
  }
}

export async function deleteApiKeyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKeyId = Number(req.params.apiKeyId);
    const apiKey = await apiKeyService.deleteApiKey(apiKeyId, req.user!.companyId);
    res.json(apiKey);
  } catch (err) {
    next(err);
  }
}
