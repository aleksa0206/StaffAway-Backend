import { RefreshToken } from "@prisma/client";
import { prisma } from "../config/prismaClient";

export async function findAllRefreshTokens(
  userId: number,
): Promise<RefreshToken[]> {
  return await prisma.refreshToken.findMany({ where: { userId } });
}

export async function findRefreshTokenById(
  refreshTokenId: number,
): Promise<RefreshToken | null> {
  return await prisma.refreshToken.findUnique({
    where: { id: refreshTokenId },
  });
}

export async function createRefreshToken(data: {
  userId: number;
  token: string;
  expiresAt: Date;
}): Promise<RefreshToken> {
  return await prisma.refreshToken.create({ data });
}

export async function revokeRefreshToken(
  refreshTokenId: number,
): Promise<RefreshToken> {
  return await prisma.refreshToken.update({
    where: { id: refreshTokenId },
    data: { revoked: true },
  });
}

export async function removeRefreshToken(
  refreshTokenId: number,
): Promise<RefreshToken> {
  return await prisma.refreshToken.delete({ where: { id: refreshTokenId } });
}

export async function findRefreshTokenByTokenHash(tokenHash: string) {
  return await prisma.refreshToken.findUnique({ where: { token: tokenHash } });
}
