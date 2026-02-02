import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "UNAUTHORIZED" });
  }

  const token = header.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET_MISSING" });
  }

  try {
    const payload = jwt.verify(token, secret) as any;
    const userId = Number(payload.sub);

    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    (req as any).auth = { userId };
    return next();
  } catch {
    return res.status(401).json({ message: "UNAUTHORIZED" });
  }
}
