import * as refreshTokenRepository from '../repositories/refreshTokenRepository';

export async function getAllRefreshTokens(userId: number) {
    return await refreshTokenRepository.findAllRefreshTokens(userId);
}

export async function getRefreshTokenById(
    refreshTokenId: number,
    userId: number,
) {
    const refreshToken =
        await refreshTokenRepository.findRefreshTokenById(refreshTokenId);
    if (!refreshToken || refreshToken.userId !== userId) {
        return null;
    }
    return refreshToken;
}

export async function createRefreshToken(data: {
    userId: number;
    token: string;
    expiresAt: Date;
}) {
    return await refreshTokenRepository.createRefreshToken(data);
}

export async function revokeRefreshToken(
    refreshTokenId: number,
    userId: number,
) {
    const refreshToken =
        await refreshTokenRepository.findRefreshTokenById(refreshTokenId);
    if (!refreshToken) {
        throw new Error('Token ne postoji');
    }
    if (refreshToken.userId !== userId) {
        throw new Error('Nemate pravo pristupa ovom tokenu');
    }
    return await refreshTokenRepository.revokeRefreshToken(refreshTokenId);
}

export async function deleteRefreshToken(
    refreshTokenId: number,
    userId: number,
) {
    const refreshToken =
        await refreshTokenRepository.findRefreshTokenById(refreshTokenId);
    if (!refreshToken) {
        throw new Error('Token ne postoji');
    }
    if (refreshToken.userId !== userId) {
        throw new Error('Nemate pravo pristupa ovom tokenu');
    }
    return await refreshTokenRepository.removeRefreshToken(refreshTokenId);
}
