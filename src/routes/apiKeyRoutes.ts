import { Router } from 'express';
import {
    getAllApiKeysHandler,
    getApiKeyByIdHandler,
    createApiKeyHandler,
    revokeApiKeyHandler,
    deleteApiKeyHandler,
} from '../controllers/apiKeyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/api-keys', authMiddleware, getAllApiKeysHandler);
router.get('/api-keys/:apiKeyId', authMiddleware, getApiKeyByIdHandler);
router.post('/api-keys', authMiddleware, createApiKeyHandler);
router.put('/api-keys/:apiKeyId/revoke', authMiddleware, revokeApiKeyHandler);
router.delete('/api-keys/:apiKeyId', authMiddleware, deleteApiKeyHandler);

export default router;
