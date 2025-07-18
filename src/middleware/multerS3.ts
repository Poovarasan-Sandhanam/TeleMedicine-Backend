import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const maxFileSize = 1024 * 1024 * 10; // 10MB

const multerSettings = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSize },
   fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    console.log("📸 File received:", file.originalname, file.mimetype);
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.warn("❌ Invalid file type:", file.mimetype);
        cb(new Error("File type is not supported"));
    }
}

});

export const uploadSingleImage = multerSettings.single("profileImage");

