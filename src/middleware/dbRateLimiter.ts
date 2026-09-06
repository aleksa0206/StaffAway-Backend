import type { Request, Response, NextFunction } from 'express';
import * as rateLimitRepository from '../repositories/rateLimitRepository';

export function dbRateLimit(options: { windowMs: number; max: number; message: string }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `${req.ip}:${req.path}`;
      const entry = await rateLimitRepository.incrementOrCreate(key, options.windowMs);

      if (entry.count > options.max) {
        res.status(429).json({ error: options.message });
        return;
      }

      next();
    } catch (err) {
      // Ako rate limiting sam padne (baza nedostupna), NE blokiramo korisnika - fail open
      next();
    }
  };
}

export const generalDbRateLimiter = dbRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later.',
});

export const loginDbRateLimiter = dbRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.',
});