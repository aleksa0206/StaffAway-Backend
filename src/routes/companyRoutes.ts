import { Router } from "express";
import {
  getAllCompaniesHandler,
  getMyCompanyHandler,
  createCompanyHandler,
  updateMyCompanyHandler,
  deleteMyCompanyHandler,
} from "../controllers/companyController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/companies", authMiddleware, getAllCompaniesHandler);
router.post("/companies", authMiddleware, createCompanyHandler);
router.get("/companies/me", authMiddleware, getMyCompanyHandler);
router.put("/companies", authMiddleware, updateMyCompanyHandler);
router.delete("/companies", authMiddleware, deleteMyCompanyHandler);

export default router;