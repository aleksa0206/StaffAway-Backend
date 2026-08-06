import { Router } from "express";
import {
  getAllLeaveTypesHandler,
  getLeaveTypeByIdHandler,
  createLeaveTypeHandler,
  updateLeaveTypeHandler,
  deleteLeaveTypeHandler,
} from "../controllers/leaveTypeController";

const router = Router();

router.get("/leave-types", getAllLeaveTypesHandler);
router.get("/leave-types/:leaveTypeId", getLeaveTypeByIdHandler);
router.post("/leave-types", createLeaveTypeHandler);
router.put("/leave-types/:leaveTypeId", updateLeaveTypeHandler);
router.delete("/leave-types/:leaveTypeId", deleteLeaveTypeHandler);

export default router;