import * as refreshTokenRepository from '../repositories/refreshTokenRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllRefreshTokens(userId: number) {
  return await refreshTokenRepository.findAllRefreshTokens(userId);
}

export async function getRefreshTokenById(refreshTokenId: number, userId: number) {
  const refreshToken = await refreshTokenRepository.findRefreshTokenById(refreshTokenId);

  if (!refreshToken) throw new NotFoundError('RefreshToken');
  if (refreshToken.userId !== userId) throw new ForbiddenError();

  return refreshToken;
}

export async function createRefreshToken(data: { userId: number; token: string; expiresAt: Date }) {
  return await refreshTokenRepository.createRefreshToken(data);
}

export async function revokeRefreshToken(refreshTokenId: number, userId: number) {
  const refreshToken = await refreshTokenRepository.findRefreshTokenById(refreshTokenId);

  if (!refreshToken) throw new NotFoundError('RefreshToken');
  if (refreshToken.userId !== userId) throw new ForbiddenError();

  return await refreshTokenRepository.revokeRefreshToken(refreshTokenId);
}

export async function deleteRefreshToken(refreshTokenId: number, userId: number) {
  const refreshToken = await refreshTokenRepository.findRefreshTokenById(refreshTokenId);

  if (!refreshToken) throw new NotFoundError('RefreshToken');
  if (refreshToken.userId !== userId) throw new ForbiddenError();

  return await refreshTokenRepository.removeRefreshToken(refreshTokenId);
}