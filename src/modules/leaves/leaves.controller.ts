import type { Request, Response } from "express";
import { leavesService } from "../leaves/leaves.services";

export class LeavesController {

  async create(req: Request, res: Response) {
    const userId = (req as any).auth.userId as number;
    const request = await leavesService.createLeaveRequest(userId, req.body);
    return res.status(201).json(request);
  }

  async getMyRequests(req: Request, res: Response) {
    const userId = (req as any).auth.userId as number;
    const requests = await leavesService.getMyRequests(userId);
    return res.json(requests);
  }

  async getBalance(req: Request, res: Response) {
    const userId = (req as any).auth.userId as number;
    const balance = await leavesService.getBalance(userId);
    return res.json(balance);
  }
}

export const leavesController = new LeavesController();