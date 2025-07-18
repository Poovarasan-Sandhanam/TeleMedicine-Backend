import multer, { MulterError } from "multer";
import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError } from "./responseHandler";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Environment variables
const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AWS_BUCKET_NAME!;
const maxFileSize = 1024 * 1024 * 10; // 10 MB

// Use in-memory storage with multer
const multerSettings = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSize },
    fileFilter: (req: any, file: any, cb: any) => {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg"
        ) {
            cb(null, true);
        } else {
            cb(new Error("File type is not supported"), false);
        }
    },
});

// Upload to S3
const uploadToS3 = async (file: Express.Multer.File) => {
    const extension = path.extname(file.originalname);
    const key = `${uuidv4()}${extension}`;

    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    // Return the URL or key
    return key;
};

// Middleware
export const uploadFilesMulterMiddleware = (
    fieldName: string,
    isSingle: boolean = false,
    maxFiles: number = 100
) => async (req: Request, res: Response, next: NextFunction) => {
    const upload = isSingle
        ? multerSettings.single(fieldName)
        : multerSettings.array(fieldName, maxFiles);

    upload(req, res, async (err: any) => {
        if (err instanceof MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return sendError(res, "File size should be a maximum of 10 MB", HttpStatusCode.UNPROCESSABLE_ENTITY);
            } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return sendError(res, `Exceeded the maximum number of files (Max ${isSingle ? 1 : maxFiles})`, HttpStatusCode.UNPROCESSABLE_ENTITY);
            } else {
                return sendError(res, err.message, HttpStatusCode.BAD_REQUEST);
            }
        } else if (err) {
            return sendError(res, "File type is not supported", HttpStatusCode.UNPROCESSABLE_ENTITY);
        }

        try {
            if (isSingle && req.file) {
                const s3Key = await uploadToS3(req.file);
                req.body.s3Key = s3Key;
            } else if (!isSingle && req.files) {
                const files = req.files as Express.Multer.File[];
                const keys = await Promise.all(files.map(uploadToS3));
                req.body.s3Keys = keys;
            }
            next();
        } catch (uploadError: any) {
            return sendError(res, "Failed to upload file to S3", HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    });
};
