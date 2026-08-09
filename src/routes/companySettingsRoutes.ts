import { Router } from "express";
import {
  getCompanySettingsHandler,
  createCompanySettingsHandler,
  updateCompanySettingsHandler,
} from "../controllers/companySettingsController";

const router = Router();

router.get("/settings", getCompanySettingsHandler);
router.post("/settings", createCompanySettingsHandler);
router.put("/settings", updateCompanySettingsHandler);

export default router;