import type { Request, Response } from 'express';
import * as refreshTokenService from '../services/refreshTokenService';

export async function getAllRefreshTokensHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const userId = req.user.userId;
        const refreshTokens =
            await refreshTokenService.getAllRefreshTokens(userId);
        res.json(refreshTokens);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function getRefreshTokenByIdHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const userId = req.user.userId;
        const refreshTokenId = Number(req.params.refreshTokenId);
        const refreshToken = await refreshTokenService.getRefreshTokenById(
            refreshTokenId,
            userId,
        );
        res.json(refreshToken);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createRefreshTokenHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const userId = req.user.userId;
        const { token, expiresAt } = req.body;
        const refreshToken = await refreshTokenService.createRefreshToken({
            userId,
            token,
            expiresAt: new Date(expiresAt),
        });
        res.status(201).json(refreshToken);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function revokeRefreshTokenHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const userId = req.user.userId;
        const refreshTokenId = Number(req.params.refreshTokenId);
        const refreshToken = await refreshTokenService.revokeRefreshToken(
            refreshTokenId,
            userId,
        );
        res.json(refreshToken);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}

export async function deleteRefreshTokenHandler(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Niste autentifikovani' });
        }
        const userId = req.user.userId;
        const refreshTokenId = Number(req.params.refreshTokenId);
        const refreshToken = await refreshTokenService.deleteRefreshToken(
            refreshTokenId,
            userId,
        );
        res.json(refreshToken);
    } catch (err: any) {
        res.status(403).json({ error: err.message });
    }
}
