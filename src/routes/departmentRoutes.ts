import { Router } from 'express';
import {
  createDepartmentHandler,
  deleteDepartmentHandler,
  getAllDepartmentsHandler,
  getDepartmentByIdHandler,
  updateDepartmentHandler,
} from '../controllers/departmentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createDepartmentSchema, updateDepartmentSchema } from '../validation/departmentSchemas';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/departments', authMiddleware, getAllDepartmentsHandler);
router.get('/departments/:departmentId', authMiddleware, getDepartmentByIdHandler);
router.post(
  '/departments',
  authMiddleware,
  requireRole('Hr'),
  validate(createDepartmentSchema),
  createDepartmentHandler
);
router.put(
  '/departments/:departmentId',
  authMiddleware,
  requireRole('Hr'),
  validate(updateDepartmentSchema),
  updateDepartmentHandler
);
router.delete(
  '/departments/:departmentId',
  authMiddleware,
  requireRole('Hr'),
  deleteDepartmentHandler
);

export default router;
