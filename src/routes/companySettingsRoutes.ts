import { Router } from 'express';
import {
  createCompanySettingsHandler,
  getCompanySettingsHandler,
  updateCompanySettingsHandler,
} from '../controllers/companySettingsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import {
  createCompanySettingsSchema,
  updateCompanySettingsSchema,
} from '../validation/companySettingsSchemas';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/settings', authMiddleware, getCompanySettingsHandler);
router.post(
  '/settings',
  authMiddleware,
  requireRole('Hr'),
  validate(createCompanySettingsSchema),
  createCompanySettingsHandler
);
router.put(
  '/settings',
  authMiddleware,
  requireRole('Hr'),
  validate(updateCompanySettingsSchema),
  updateCompanySettingsHandler
);

export default router;
