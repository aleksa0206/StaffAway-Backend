import { Router } from "express";
import {
  getAllLeaveTypesHandler,
  getLeaveTypeByIdHandler,
  createLeaveTypeHandler,
  updateLeaveTypeHandler,
  deleteLeaveTypeHandler,
} from "../controllers/leaveTypeController";
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get("/leave-types",authMiddleware, getAllLeaveTypesHandler);
router.get("/leave-types/:leaveTypeId",authMiddleware, getLeaveTypeByIdHandler);
router.post("/leave-types",authMiddleware, createLeaveTypeHandler);
router.put("/leave-types/:leaveTypeId",authMiddleware, updateLeaveTypeHandler);
router.delete("/leave-types/:leaveTypeId",authMiddleware, deleteLeaveTypeHandler);

export default router;