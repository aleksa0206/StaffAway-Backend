import { Router } from 'express';
import {
  createUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/users', authMiddleware, getAllUsersHandler);
router.get('/users/:userId', authMiddleware, getUserByIdHandler);
router.post('/users', authMiddleware, createUserHandler);
router.put('/users/:userId', authMiddleware, updateUserHandler);
router.delete('/users/:userId', authMiddleware, deleteUserHandler);

export default router;