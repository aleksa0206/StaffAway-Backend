import type { Request, Response } from "express";
import { authService } from "../auth/auth.service";  // ← Import singleton instance

export class AuthController {

  async register(req: Request, res: Response) {
    const { email, name, password } = req.body;
    const user = await authService.register(email, name, password);
    return res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.json(result);
  }

  async me(req: Request, res: Response) {
    const userId = (req as any).auth.userId as number;
    const user = await authService.me(userId);
    return res.json(user);
  }
}

export const authController = new AuthController();