import { Router } from 'express';
import {
    createDepartmentHandler,
    deleteDepartmentHandler,
    getAllDepartmentsHandler,
    getDepartmentByIdHandler,
    updateDepartmentHandler,
} from '../controllers/departmentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/departments', authMiddleware, getAllDepartmentsHandler);
router.get(
    '/departments/:departmentId',
    authMiddleware,
    getDepartmentByIdHandler,
);
router.post('/departments', authMiddleware, createDepartmentHandler);
router.put(
    '/departments/:departmentId',
    authMiddleware,
    updateDepartmentHandler,
);
router.delete(
    '/departments/:departmentId',
    authMiddleware,
    deleteDepartmentHandler,
);

export default router;
