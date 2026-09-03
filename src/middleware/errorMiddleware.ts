import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { TwoFactorRequiredError } from '../errors/TwoFactorRequiredError';
import { logger } from '../config/logger';

export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof TwoFactorRequiredError) {
    res.status(err.statusCode).json({ error: err.message, tempToken: err.tempToken, twoFactorRequired: true });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}