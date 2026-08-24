import type { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function loginHandler(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.login(email, password);
        res.json({ token, user });
    } catch (err: any) {
        res.status(401).json({ error: err.message });
    }
}
