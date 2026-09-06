import { Router } from 'express';
import {
  getAllApiKeysHandler,
  getApiKeyByIdHandler,
  createApiKeyHandler,
  revokeApiKeyHandler,
  deleteApiKeyHandler,
} from '../controllers/apiKeyController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { createApiKeySchema } from '../validation/apiKeySchemas';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/api-keys', authMiddleware, getAllApiKeysHandler);
router.get('/api-keys/:apiKeyId', authMiddleware, getApiKeyByIdHandler);
router.post(
  '/api-keys',
  authMiddleware,
  requireRole('Hr'),
  validate(createApiKeySchema),
  createApiKeyHandler
);
router.put('/api-keys/:apiKeyId/revoke', authMiddleware, requireRole('Hr'), revokeApiKeyHandler);
router.delete('/api-keys/:apiKeyId', authMiddleware, requireRole('Hr'), deleteApiKeyHandler);

export default router;
