import { Router } from "express";
import {
  loginHandler,
  verifyTwoFactorLoginHandler,
  setupTwoFactorHandler,
  confirmTwoFactorHandler,
  disableTwoFactorHandler,
  refreshHandler,
  logoutHandler,
} from "../controllers/authController";
import { loginRateLimiter } from "../middleware/rateLimit";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/auth/login", loginRateLimiter, loginHandler);
router.post(
  "/auth/2fa/verify-login",
  loginRateLimiter,
  verifyTwoFactorLoginHandler,
);
router.post("/auth/2fa/setup", authMiddleware, setupTwoFactorHandler);
router.post("/auth/2fa/confirm", authMiddleware, confirmTwoFactorHandler);
router.delete("/auth/2fa", authMiddleware, disableTwoFactorHandler);
router.post("/auth/refresh", refreshHandler);
router.post("/auth/logout", logoutHandler);

export default router;
