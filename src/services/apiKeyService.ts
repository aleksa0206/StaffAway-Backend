import * as apiKeyRepository from '../repositories/apiKeyRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllApiKeys(companyId: number) {
  return await apiKeyRepository.findAllApiKeys(companyId);
}

export async function getApiKeyById(apiKeyId: number, companyId: number) {
  const apiKey = await apiKeyRepository.findApiKeyById(apiKeyId);

  if (!apiKey) throw new NotFoundError('ApiKey');
  if (apiKey.companyId !== companyId) throw new ForbiddenError();

  return apiKey;
}

export async function createApiKey(data: { key: string; name: string; companyId: number }) {
  return await apiKeyRepository.createApiKey(data);
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