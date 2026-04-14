// modules/auth/auth.routes.ts

import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "./auth.schemas";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);

authRouter.get("/me", authMiddleware.authenticate, authController.me);
