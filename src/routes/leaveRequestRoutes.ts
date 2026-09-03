import { Router } from "express";
import {
  getAllLeaveRequestsHandler,
  getLeaveRequestByIdHandler,
  createLeaveRequestHandler,
  updateLeaveRequestHandler,
  deleteLeaveRequestHandler,
} from "../controllers/leaveRequestController";
import { authMiddleware } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
} from "../validation/leaveRequestSchemas";

const router = Router();

router.get("/leave-requests", authMiddleware, getAllLeaveRequestsHandler);
router.get(
  "/leave-requests/:leaveRequestId",
  authMiddleware,
  getLeaveRequestByIdHandler,
);
router.post(
  "/leave-requests",
  authMiddleware,
  validate(createLeaveRequestSchema),
  createLeaveRequestHandler,
);
router.put(
  "/leave-requests/:leaveRequestId",
  authMiddleware,
  validate(updateLeaveRequestSchema),
  updateLeaveRequestHandler,
);
router.delete(
  "/leave-requests/:leaveRequestId",
  authMiddleware,
  deleteLeaveRequestHandler,
);

export default router;
