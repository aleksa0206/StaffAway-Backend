import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = decoded as unknown as {
      userId: number;
      role: 'Employee' | 'Manager' | 'Hr';
      companyId: number;
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
