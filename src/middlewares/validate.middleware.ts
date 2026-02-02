import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

type Targets = Partial<{
  body: z.ZodTypeAny;
  query: z.ZodTypeAny;
  params: z.ZodTypeAny;
}>;

export function validate(targets: Targets) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const key of ["body", "query", "params"] as const) {
        const schema = targets[key];
        if (!schema) continue;

        const result = schema.safeParse(req[key]);

        if (!result.success) {
          return res.status(400).json({
            message: "VALIDATION_ERROR",
            where: key,
            errors: result.error.issues, // ✅ v4, nije deprecated
          });
        }

        // overwrite sa validiranim podacima
        (req as any)[key] = result.data;
      }

      next();
    } catch {
      return res.status(400).json({ message: "VALIDATION_ERROR" });
    }
  };
}
