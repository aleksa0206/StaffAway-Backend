import { Router } from 'express';
import {
  loginHandler,
  verifyTwoFactorLoginHandler,
  setupTwoFactorHandler,
  confirmTwoFactorHandler,
  disableTwoFactorHandler,
  refreshHandler,
  logoutHandler,
  requestPasswordResetHandler,
  resetPasswordHandler,
} from '../controllers/authController';
import { loginDbRateLimiter } from '../middleware/dbRateLimiter';
import { authMiddleware } from '../middleware/authMiddleware';
const router = Router();
router.post('/auth/login', loginDbRateLimiter, loginHandler);
router.post('/auth/2fa/verify-login', loginDbRateLimiter, verifyTwoFactorLoginHandler);
router.post('/auth/2fa/setup', authMiddleware, setupTwoFactorHandler);
router.post('/auth/2fa/confirm', authMiddleware, confirmTwoFactorHandler);
router.delete('/auth/2fa', authMiddleware, disableTwoFactorHandler);
router.post('/auth/refresh', refreshHandler);
router.post('/auth/logout', logoutHandler);
router.post('/auth/forgot-password', loginDbRateLimiter, requestPasswordResetHandler);
router.post('/auth/reset-password', loginDbRateLimiter, resetPasswordHandler);
export default router;
