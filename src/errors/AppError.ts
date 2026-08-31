import { ErrorCode } from './errorCodes';

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;

    constructor(code: ErrorCode, message: string, statusCode: number) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

export const notFound = (resource: string) =>
    new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404);

export const forbidden = (message = 'Access denied') =>
    new AppError(ErrorCode.FORBIDDEN, message, 403);

export const validationError = (message: string) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400);
