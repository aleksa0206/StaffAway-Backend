import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Nedostaje token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Nedostaje token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded as unknown as {
            userId: number;
            role: 'Employee' | 'Manager' | 'Hr';
            companyId: number;
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Nevalidan ili istekao token' });
    }
}
