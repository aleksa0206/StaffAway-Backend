import { Router } from "express";
import {
  createUserHandler,
  getAllUsersHandler,
} from "../controllers/userController";

const router = Router();

router.get("/users", getAllUsersHandler);
router.post("/users", createUserHandler);

export default router;
