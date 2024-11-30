import multer from 'multer';
import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError } from "./responseHandler";

// Common settings for multer
const maxFileSize = 1024 * 1024 * 10; // 10 MB

const multerSettings = {
    limits: {
        fileSize: maxFileSize
    },
    fileFilter: (req: any, file: any, done: any) => {
        /*if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg"
        ) {
            done(null, true);
        } else {
            done(new Error("File type is not supported"), false);
        }*/
        done(null, true);
    },
};

// Middleware for handling single and multiple file uploads
export const uploadFilesMulterMiddleware = (
    arrayName: string,
    isSingle: boolean = false,
    maxFiles: number = 100
) => (req: Request, res: Response, next: NextFunction) => {
    const upload = isSingle
        ? multer(multerSettings).single(arrayName)
        : multer(multerSettings).array(arrayName, maxFiles);

    upload(req, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return sendError(res, "File size should be maximum 10 MB", HttpStatusCode.UNPROCESSABLE_ENTITY);
            } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return sendError(res, `Max number of documents exceeded (Max ${isSingle ? 1 : maxFiles})`, HttpStatusCode.UNPROCESSABLE_ENTITY);
            } else {
                return sendError(res, err.message, HttpStatusCode.BAD_REQUEST);
            }
        } else if (err) {
            return sendError(res, "File type is not supported", HttpStatusCode.UNPROCESSABLE_ENTITY);
        }
        next();
    });
};