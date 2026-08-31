import type { Response } from 'express';
import { AppError } from './AppError';
import { ErrorCode } from './errorCodes';

export function handleControllerError(err: unknown, res: Response) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ code: err.code, error: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({
        code: ErrorCode.INTERNAL_ERROR,
        error: 'Internal server error',
    });
}
