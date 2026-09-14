import { Router } from 'express';
import {
  getAllLeaveBalancesHandler,
  getLeaveBalanceByIdHandler,
  createLeaveBalanceHandler,
  updateLeaveBalanceHandler,
  deleteLeaveBalanceHandler,
} from '../controllers/leaveBalanceController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/requireRole';
import { validate } from '../middleware/validate';
import {
  createLeaveBalanceSchema,
  updateLeaveBalanceSchema,
} from '../validation/leaveBalanceSchemas';

const router = Router();

router.get('/leave-balances', authMiddleware, getAllLeaveBalancesHandler);
router.get('/leave-balances/:leaveBalanceId', authMiddleware, getLeaveBalanceByIdHandler);
router.post(
  '/leave-balances',
  authMiddleware,
  requireRole('Hr'),
  validate(createLeaveBalanceSchema),
  createLeaveBalanceHandler
);
router.put(
  '/leave-balances/:leaveBalanceId',
  authMiddleware,
  requireRole('Hr'),
  validate(updateLeaveBalanceSchema),
  updateLeaveBalanceHandler
);
router.delete(
  '/leave-balances/:leaveBalanceId',
  authMiddleware,
  requireRole('Hr'),
  deleteLeaveBalanceHandler
);

export default router;
