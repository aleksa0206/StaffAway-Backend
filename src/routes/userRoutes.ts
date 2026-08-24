import { Router } from 'express';
import {
    createUserHandler,
    getAllUsersHandler,
} from '../controllers/userController';
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get('/users',authMiddleware, getAllUsersHandler);
router.post('/users',authMiddleware, createUserHandler);

export default router;
