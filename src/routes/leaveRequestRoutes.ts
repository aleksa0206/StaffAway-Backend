import { Router } from "express";
import {
  getAllLeaveRequestsHandler,
  getLeaveRequestByIdHandler,
  createLeaveRequestHandler,
  updateLeaveRequestHandler,
  deleteLeaveRequestHandler,
} from "../controllers/leaveRequestController";

const router = Router();

router.get("/leave-requests", getAllLeaveRequestsHandler);
router.get("/leave-requests/:leaveRequestId", getLeaveRequestByIdHandler);
router.post("/leave-requests", createLeaveRequestHandler);
router.put("/leave-requests/:leaveRequestId", updateLeaveRequestHandler);
router.delete("/leave-requests/:leaveRequestId", deleteLeaveRequestHandler);

export default router;