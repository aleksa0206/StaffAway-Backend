import type { Request, Response } from "express";
import type { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    const user = await this.authService.register(email, name, password);
    return res.status(201).json(user);
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    return res.json(result);
  };

  me = async (req: Request, res: Response) => {
    const userId = (req as any).auth.userId as number;
    const user = await this.authService.me(userId);
    return res.json(user);
  };
}
