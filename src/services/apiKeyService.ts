import * as apiKeyRepository from "../repositories/apiKeyRepository";

export async function getAllApiKeys() {
  return await apiKeyRepository.findAllApiKeys();
}

export async function getApiKeyById(apiKeyId: number) {
  return await apiKeyRepository.findApiKeyById(apiKeyId);
}

export async function createApiKey(data: {
  key: string;
  name: string;
  companyId: number;
}) {
  return await apiKeyRepository.createApiKey(data);
}

export async function revokeApiKey(apiKeyId: number) {
  return await apiKeyRepository.revokeApiKey(apiKeyId);
}

export async function deleteApiKey(apiKeyId: number) {
  return await apiKeyRepository.removeApiKey(apiKeyId);
}