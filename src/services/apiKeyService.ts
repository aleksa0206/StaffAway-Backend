import crypto from 'crypto';
import * as apiKeyRepository from '../repositories/apiKeyRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllApiKeys(companyId: number, pagination: { skip: number; take: number }) {
  return await apiKeyRepository.findAllApiKeys(companyId, pagination);
}

export async function getApiKeyById(apiKeyId: number, companyId: number) {
  const apiKey = await apiKeyRepository.findApiKeyById(apiKeyId);

  if (!apiKey) throw new NotFoundError('ApiKey');
  if (apiKey.companyId !== companyId) throw new ForbiddenError();

  return apiKey;
}

export async function createApiKey(data: { name: string; companyId: number }) {
  const key = crypto.randomBytes(32).toString('hex');
  return await apiKeyRepository.createApiKey({ key, name: data.name, companyId: data.companyId });
}

export async function revokeApiKey(apiKeyId: number, companyId: number) {
  const apiKey = await apiKeyRepository.findApiKeyById(apiKeyId);

  if (!apiKey) throw new NotFoundError('ApiKey');
  if (apiKey.companyId !== companyId) throw new ForbiddenError();

  return await apiKeyRepository.revokeApiKey(apiKeyId);
}

export async function deleteApiKey(apiKeyId: number, companyId: number) {
  const apiKey = await apiKeyRepository.findApiKeyById(apiKeyId);

  if (!apiKey) throw new NotFoundError('ApiKey');
  if (apiKey.companyId !== companyId) throw new ForbiddenError();

  return await apiKeyRepository.removeApiKey(apiKeyId);
}
