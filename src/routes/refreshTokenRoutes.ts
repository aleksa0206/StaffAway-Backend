import { Router } from "express";
import {
  getAllRefreshTokensHandler,
  getRefreshTokenByIdHandler,
  createRefreshTokenHandler,
  revokeRefreshTokenHandler,
  deleteRefreshTokenHandler,
} from "../controllers/refreshTokenController";

const router = Router();

router.get("/refresh-tokens", getAllRefreshTokensHandler);
router.get("/refresh-tokens/:refreshTokenId", getRefreshTokenByIdHandler);
router.post("/refresh-tokens", createRefreshTokenHandler);
router.put("/refresh-tokens/:refreshTokenId/revoke", revokeRefreshTokenHandler);
router.delete("/refresh-tokens/:refreshTokenId", deleteRefreshTokenHandler);

export default router;