import { Router } from 'express';
import {
    createCompanyHandler,
    deleteCompanyHandler,
    getAllCompaniesHandler,
    getCompanyByIdHandler,
    updateCompanyHandler,
} from '../controllers/companyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/companies', authMiddleware, getAllCompaniesHandler);
router.get('/companies/:companyId', authMiddleware, getCompanyByIdHandler);
router.post('/companies', authMiddleware, createCompanyHandler);
router.put('/companies/:companyId', authMiddleware, updateCompanyHandler);
router.delete('/companies/:companyId', authMiddleware, deleteCompanyHandler);

export default router;
