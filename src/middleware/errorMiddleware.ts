import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { TwoFactorRequiredError } from '../errors/TwoFactorRequiredError';

export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof TwoFactorRequiredError) {
    res.status(err.statusCode).json({ error: err.message, tempToken: err.tempToken, twoFactorRequired: true });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}