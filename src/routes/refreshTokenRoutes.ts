import { Router } from 'express';
import {
  getAllRefreshTokensHandler,
  getRefreshTokenByIdHandler,
  createRefreshTokenHandler,
  revokeRefreshTokenHandler,
  deleteRefreshTokenHandler,
} from '../controllers/refreshTokenController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createRefreshTokenSchema } from '../validation/refreshTokenSchemas';

const router = Router();

router.get('/refresh-tokens', authMiddleware, getAllRefreshTokensHandler);
router.get('/refresh-tokens/:refreshTokenId', authMiddleware, getRefreshTokenByIdHandler);
router.post(
  '/refresh-tokens',
  authMiddleware,
  validate(createRefreshTokenSchema),
  createRefreshTokenHandler
);
router.put('/refresh-tokens/:refreshTokenId/revoke', authMiddleware, revokeRefreshTokenHandler);
router.delete('/refresh-tokens/:refreshTokenId', authMiddleware, deleteRefreshTokenHandler);

export default router;
