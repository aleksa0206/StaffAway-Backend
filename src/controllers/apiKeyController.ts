import type { Request, Response } from "express";
import * as apiKeyService from "../services/apiKeyService";

export async function getAllApiKeysHandler(req: Request, res: Response) {
  try {
    const apiKeys = await apiKeyService.getAllApiKeys();
    res.json(apiKeys);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getApiKeyByIdHandler(req: Request, res: Response) {
  try {
    const apiKeyId = Number(req.params.apiKeyId);
    const apiKey = await apiKeyService.getApiKeyById(apiKeyId);
    res.json(apiKey);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createApiKeyHandler(req: Request, res: Response) {
  try {
    const { key, name, companyId } = req.body;
    const apiKey = await apiKeyService.createApiKey({ key, name, companyId });
    res.status(201).json(apiKey);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function revokeApiKeyHandler(req: Request, res: Response) {
  try {
    const apiKeyId = Number(req.params.apiKeyId);
    const apiKey = await apiKeyService.revokeApiKey(apiKeyId);
    res.json(apiKey);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteApiKeyHandler(req: Request, res: Response) {
  try {
    const apiKeyId = Number(req.params.apiKeyId);
    const apiKey = await apiKeyService.deleteApiKey(apiKeyId);
    res.json(apiKey);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}