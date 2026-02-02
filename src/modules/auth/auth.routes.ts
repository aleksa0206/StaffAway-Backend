import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "./auth.schemas";
import { UsersRepository } from "../users/users.repository";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

const usersRepo = new UsersRepository();
const authService = new AuthService(usersRepo);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), authController.register);
authRouter.post("/login", validate({ body: loginSchema }), authController.login);
authRouter.get("/me", authMiddleware, authController.me);
