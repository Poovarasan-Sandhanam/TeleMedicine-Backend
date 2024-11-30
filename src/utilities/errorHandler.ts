import { Request, Response, NextFunction } from 'express';
import HttpStatusCode from 'http-status-codes';
import CustomError from './customError';
import { sendError } from './responseHandler';
import {validationResult} from "express-validator";

export const handleValidationResult = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array()[0]?.msg || 'Validation error';
        return sendError(res, errorMsg, HttpStatusCode.UNPROCESSABLE_ENTITY);
    }
    next();
};

export const handleError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CustomError) {
        return sendError(res, err.message, err.statusCode);
    }
    return sendError(res, 'Internal Server Error', HttpStatusCode.INTERNAL_SERVER_ERROR);
};
