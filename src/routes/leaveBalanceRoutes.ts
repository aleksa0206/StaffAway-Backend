import { Router } from "express";
import {
  getAllLeaveBalancesHandler,
  getLeaveBalanceByIdHandler,
  createLeaveBalanceHandler,
  updateLeaveBalanceHandler,
  deleteLeaveBalanceHandler,
} from "../controllers/leaveBalanceController";

const router = Router();

router.get("/leave-balances", getAllLeaveBalancesHandler);
router.get("/leave-balances/:leaveBalanceId", getLeaveBalanceByIdHandler);
router.post("/leave-balances", createLeaveBalanceHandler);
router.put("/leave-balances/:leaveBalanceId", updateLeaveBalanceHandler);
router.delete("/leave-balances/:leaveBalanceId", deleteLeaveBalanceHandler);

export default router;