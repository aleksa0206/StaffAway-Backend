import type { Request, Response, NextFunction } from 'express';
import * as refreshTokenService from '../services/refreshTokenService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';

export async function getAllRefreshTokensHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const { data, total } = await refreshTokenService.getAllRefreshTokens(
      req.user!.userId,
      pagination
    );
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}

export async function getRefreshTokenByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshTokenId = Number(req.params.refreshTokenId);
    const refreshToken = await refreshTokenService.getRefreshTokenById(
      refreshTokenId,
      req.user!.userId
    );
    res.json(refreshToken);
  } catch (err) {
    next(err);
  }
}

export async function createRefreshTokenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, expiresAt } = req.body;
    const refreshToken = await refreshTokenService.createRefreshToken({
      userId: req.user!.userId,
      token,
      expiresAt: new Date(expiresAt),
    });
    res.status(201).json(refreshToken);
  } catch (err) {
    next(err);
  }
}

export async function revokeRefreshTokenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshTokenId = Number(req.params.refreshTokenId);
    const refreshToken = await refreshTokenService.revokeRefreshToken(
      refreshTokenId,
      req.user!.userId
    );
    res.json(refreshToken);
  } catch (err) {
    next(err);
  }
}

export async function deleteRefreshTokenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshTokenId = Number(req.params.refreshTokenId);
    const refreshToken = await refreshTokenService.deleteRefreshToken(
      refreshTokenId,
      req.user!.userId
    );
    res.json(refreshToken);
  } catch (err) {
    next(err);
  }
}
