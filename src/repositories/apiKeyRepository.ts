import { ApiKey } from "@prisma/client";
import { prisma } from "../config/prismaClient";

export async function findAllApiKeys(companyId: number): Promise<ApiKey[]> {
  return await prisma.apiKey.findMany({where: {companyId}});
}

export async function findApiKeyById(apiKeyId: number): Promise<ApiKey | null> {
  return await prisma.apiKey.findUnique({ where: { id: apiKeyId } });
}

export async function createApiKey(data: {
  key: string;
  name: string;
  companyId: number;
}): Promise<ApiKey> {
  return await prisma.apiKey.create({ data });
}

export async function revokeApiKey(apiKeyId: number): Promise<ApiKey> {
  return await prisma.apiKey.update({ where: { id: apiKeyId }, data: { revoked: true } });
}

export async function removeApiKey(apiKeyId: number): Promise<ApiKey> {
  return await prisma.apiKey.delete({ where: { id: apiKeyId } });
}