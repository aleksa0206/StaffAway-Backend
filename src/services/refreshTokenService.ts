import * as refreshTokenRepository from "../repositories/refreshTokenRepository";

export async function getAllRefreshTokens() {
  return await refreshTokenRepository.findAllRefreshTokens();
}

export async function getRefreshTokenById(refreshTokenId: number) {
  return await refreshTokenRepository.findRefreshTokenById(refreshTokenId);
}

export async function createRefreshToken(data: {
  userId: number;
  token: string;
  expiresAt: Date;
}) {
  return await refreshTokenRepository.createRefreshToken(data);
}

export async function revokeRefreshToken(refreshTokenId: number) {
  return await refreshTokenRepository.revokeRefreshToken(refreshTokenId);
}

export async function deleteRefreshToken(refreshTokenId: number) {
  return await refreshTokenRepository.removeRefreshToken(refreshTokenId);
}
