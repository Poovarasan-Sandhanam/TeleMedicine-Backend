import multer, { MulterError } from "multer";
import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError } from "./responseHandler";
import path from "path";
import fs from "fs";

// Maximum file size (10 MB)
const maxFileSize = 1024 * 1024 * 10;

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for local storage
const multerSettings = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir); // Save files in the "uploads" directory
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const extension = path.extname(file.originalname);
            cb(null, `${uniqueSuffix}${extension}`); // Unique filename
        },
    }),
    limits: {
        fileSize: maxFileSize,
    },
    fileFilter: (req: any, file: any, done: any) => {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg"
        ) {
            done(null, true);
        } else {
            done(new Error("File type is not supported"), false);
        }
        done(null, true);
    },
});

// Middleware for handling single and multiple file uploads
export const uploadFilesMulterMiddleware = (
    fieldName: string,
    isSingle: boolean = false,
    maxFiles: number = 100
) => (req: Request, res: Response, next: NextFunction) => {
    const upload = isSingle
        ? multerSettings.single(fieldName)
        : multerSettings.array(fieldName, maxFiles);

    upload(req, res, (err: any) => {
        if (err instanceof MulterError) {
            // Handle Multer errors
            if (err.code === "LIMIT_FILE_SIZE") {
                return sendError(res, "File size should be a maximum of 10 MB", HttpStatusCode.UNPROCESSABLE_ENTITY);
            } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return sendError(
                    res,
                    `Exceeded the maximum number of files (Max ${isSingle ? 1 : maxFiles})`,
                    HttpStatusCode.UNPROCESSABLE_ENTITY
                );
            } else {
                return sendError(res, err.message, HttpStatusCode.BAD_REQUEST);
            }
        } else if (err) {
            // Handle custom errors (e.g., invalid file type)
            return sendError(res, "File type is not supported", HttpStatusCode.UNPROCESSABLE_ENTITY);
        }

        // Proceed to the next middleware
        next();
    });
};