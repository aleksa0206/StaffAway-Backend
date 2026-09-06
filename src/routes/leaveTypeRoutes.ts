import { Router } from 'express';
import {
  getAllLeaveTypesHandler,
  getLeaveTypeByIdHandler,
  createLeaveTypeHandler,
  updateLeaveTypeHandler,
  deleteLeaveTypeHandler,
} from '../controllers/leaveTypeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createLeaveTypeSchema, updateLeaveTypeSchema } from '../validation/leaveTypeSchemas';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/leave-types', authMiddleware, getAllLeaveTypesHandler);
router.get('/leave-types/:leaveTypeId', authMiddleware, getLeaveTypeByIdHandler);
router.post(
  '/leave-types',
  authMiddleware,
  requireRole('Hr'),
  validate(createLeaveTypeSchema),
  createLeaveTypeHandler
);
router.put(
  '/leave-types/:leaveTypeId',
  authMiddleware,
  requireRole('Hr'),
  validate(updateLeaveTypeSchema),
  updateLeaveTypeHandler
);
router.delete(
  '/leave-types/:leaveTypeId',
  authMiddleware,
  requireRole('Hr'),
  deleteLeaveTypeHandler
);

export default router;
