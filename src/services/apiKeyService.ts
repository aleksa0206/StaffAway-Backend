import * as apiKeyRepository from '../repositories/apiKeyRepository';

export async function getAllApiKeys(companyId: number) {
    return await apiKeyRepository.findAllApiKeys(companyId);
}

export async function getApiKeyById(apiKeyId: number, companyId: number) {
    const apiKey = await apiKeyRepository.findApiKeyById(apiKeyId);
    if (!apiKey || apiKey.companyId !== companyId) {
        return null;
    }
    return apiKey;
}

export async function createApiKey(data: {
    key: string;
    name: string;
    companyId: number;
}) {
    return await apiKeyRepository.createApiKey(data);
}

export async function revokeApiKey(apiKeyId: number, companyId: number) {
    const apiKey = await apiKeyRepository.findApiKeyById(apiKeyId);
    if (!apiKey) throw new Error('API ključ ne postoji');
    if (apiKey.companyId !== companyId)
        throw new Error('Nemate pravo pristupa ovom ključu');
    return await apiKeyRepository.revokeApiKey(apiKeyId);
}

export async function deleteApiKey(apiKeyId: number, companyId: number) {
    const apiKey = await apiKeyRepository.findApiKeyById(apiKeyId);
    if (!apiKey) throw new Error('API ključ ne postoji');
    if (apiKey.companyId !== companyId)
        throw new Error('Nemate pravo pristupa ovom ključu');
    return await apiKeyRepository.removeApiKey(apiKeyId);
}
