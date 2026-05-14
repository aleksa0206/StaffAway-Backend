import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createLeaveRequestSchema } from "./leaves.schemas";
import { leavesController } from "./leaves.controller";

export const leavesRouter = Router();

// Sve rute zahtevaju autentifikaciju
leavesRouter.use(authMiddleware.authenticate);

leavesRouter.post(
  "/",
  validate({ body: createLeaveRequestSchema }),
  leavesController.create
);

leavesRouter.get(
  "/",
  leavesController.getMyRequests
);

leavesRouter.get(
  "/balance",
  leavesController.getBalance
);