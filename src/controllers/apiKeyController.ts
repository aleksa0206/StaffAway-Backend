import type { Request, Response, NextFunction } from 'express';
import * as apiKeyService from '../services/apiKeyService';

export async function getAllApiKeysHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKeys = await apiKeyService.getAllApiKeys(req.user!.companyId);
    res.json(apiKeys);
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