"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFilesMulterMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const responseHandler_1 = require("./responseHandler");
// Common settings for multer
const maxFileSize = 1024 * 1024 * 10; // 10 MB
const multerSettings = {
    limits: {
        fileSize: maxFileSize
    },
    fileFilter: (req, file, done) => {
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
const uploadFilesMulterMiddleware = (arrayName, isSingle = false, maxFiles = 100) => (req, res, next) => {
    const upload = isSingle
        ? (0, multer_1.default)(multerSettings).single(arrayName)
        : (0, multer_1.default)(multerSettings).array(arrayName, maxFiles);
    upload(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return (0, responseHandler_1.sendError)(res, "File size should be maximum 10 MB", http_status_codes_1.default.UNPROCESSABLE_ENTITY);
            }
            else if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return (0, responseHandler_1.sendError)(res, `Max number of documents exceeded (Max ${isSingle ? 1 : maxFiles})`, http_status_codes_1.default.UNPROCESSABLE_ENTITY);
            }
            else {
                return (0, responseHandler_1.sendError)(res, err.message, http_status_codes_1.default.BAD_REQUEST);
            }
        }
        else if (err) {
            return (0, responseHandler_1.sendError)(res, "File type is not supported", http_status_codes_1.default.UNPROCESSABLE_ENTITY);
        }
        next();
    });
};
exports.uploadFilesMulterMiddleware = uploadFilesMulterMiddleware;
