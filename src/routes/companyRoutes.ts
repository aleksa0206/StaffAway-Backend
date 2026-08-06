import { Router } from "express";
import {
  getAllCompaniesHandler,
  getCompanyByIdHandler,
  createCompanyHandler,
  updateCompanyHandler,
  deleteCompanyHandler,
} from "../controllers/companyController";

const router = Router();

router.get("/companies", getAllCompaniesHandler);
router.get("/companies/:companyId", getCompanyByIdHandler);
router.post("/companies", createCompanyHandler);
router.put("/companies/:companyId", updateCompanyHandler);
router.delete("/companies/:companyId", deleteCompanyHandler);

export default router;
