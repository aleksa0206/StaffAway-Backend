import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

const ROLES = ['Employee', 'Manager', 'Hr'];

function deny(req: Request, res: Response, error: string) {
  logger.warn({ path: req.path, method: req.method, status: 401 }, 'Security-relevant denial');
  return res.status(401).json({ error });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return deny(req, res, 'Missing token');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return deny(req, res, 'Missing token');
  }

  let decoded: jwt.JwtPayload | string;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    return deny(req, res, 'Invalid or expired token');
  }

  // Other tokens signed with the same secret (the 2FA temp token) are not access tokens.
  if (
    typeof decoded === 'string' ||
    decoded.purpose !== undefined ||
    typeof decoded.userId !== 'number' ||
    typeof decoded.companyId !== 'number' ||
    !ROLES.includes(decoded.role)
  ) {
    return deny(req, res, 'Invalid or expired token');
  }

  req.user = {
    userId: decoded.userId,
    role: decoded.role,
    companyId: decoded.companyId,
  };
  next();
}
