import { Router } from 'express';
import {
  getAllCompaniesHandler,
  getMyCompanyHandler,
  createCompanyHandler,
  updateMyCompanyHandler,
  deleteMyCompanyHandler,
} from '../controllers/companyController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createCompanySchema, updateCompanySchema } from '../validation/companySchemas';

const router = Router();

router.get('/companies', authMiddleware, getAllCompaniesHandler);
router.post('/companies', authMiddleware, validate(createCompanySchema), createCompanyHandler);
router.get('/companies/me', authMiddleware, getMyCompanyHandler);
router.put('/companies', authMiddleware, validate(updateCompanySchema), updateMyCompanyHandler);
router.delete('/companies', authMiddleware, deleteMyCompanyHandler);

export default router;
