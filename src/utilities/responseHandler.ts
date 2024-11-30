import { Response } from 'express';
import HttpStatusCode from 'http-status-codes';

export const sendSuccess = (res: Response, data: any, message: string = 'Success', statusCode: number = HttpStatusCode.OK) => {
    return res.status(statusCode).json({
        status: true,
        message,
        data
    });
};

export const sendError = (res: Response, message: string = 'Error', statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR) => {
    return res.status(statusCode).json({
        status: false,
        message
    });
};
