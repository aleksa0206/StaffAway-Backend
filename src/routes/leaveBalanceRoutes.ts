import { Router } from "express";
import {
  getAllLeaveBalancesHandler,
  getLeaveBalanceByIdHandler,
  createLeaveBalanceHandler,
  updateLeaveBalanceHandler,
  deleteLeaveBalanceHandler,
} from "../controllers/leaveBalanceController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get("/leave-balances",authMiddleware, getAllLeaveBalancesHandler);
router.get("/leave-balances/:leaveBalanceId",authMiddleware, getLeaveBalanceByIdHandler);
router.post("/leave-balances",authMiddleware, createLeaveBalanceHandler);
router.put("/leave-balances/:leaveBalanceId",authMiddleware, updateLeaveBalanceHandler);
router.delete("/leave-balances/:leaveBalanceId",authMiddleware, deleteLeaveBalanceHandler);

export default router;