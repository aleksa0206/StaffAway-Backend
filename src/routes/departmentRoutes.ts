import { Router } from "express";
import {
  getAllDepartmentsHandler,
  getDepartmentByIdHandler,
  createDepartmentHandler,
  updateDepartmentHandler,
  deleteDepartmentHandler,
} from "../controllers/departmentController";

const router = Router();

router.get("/departments", getAllDepartmentsHandler);
router.get("/departments/:departmentId", getDepartmentByIdHandler);
router.post("/departments", createDepartmentHandler);
router.put("/departments/:departmentId", updateDepartmentHandler);
router.delete("/departments/:departmentId", deleteDepartmentHandler);

export default router;
