import { Router } from 'express';
import {
    createCompanySettingsHandler,
    getCompanySettingsHandler,
    updateCompanySettingsHandler,
} from '../controllers/companySettingsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/settings', authMiddleware, getCompanySettingsHandler);
router.post('/settings', authMiddleware, createCompanySettingsHandler);
router.put('/settings', authMiddleware, updateCompanySettingsHandler);

export default router;
