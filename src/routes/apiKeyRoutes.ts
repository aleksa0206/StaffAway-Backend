import { Router } from "express";
import {
  getAllApiKeysHandler,
  getApiKeyByIdHandler,
  createApiKeyHandler,
  revokeApiKeyHandler,
  deleteApiKeyHandler,
} from "../controllers/apiKeyController";

const router = Router();

router.get("/api-keys", getAllApiKeysHandler);
router.get("/api-keys/:apiKeyId", getApiKeyByIdHandler);
router.post("/api-keys", createApiKeyHandler);
router.put("/api-keys/:apiKeyId/revoke", revokeApiKeyHandler);
router.delete("/api-keys/:apiKeyId", deleteApiKeyHandler);

export default router;