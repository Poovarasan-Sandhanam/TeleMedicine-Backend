// middlewares/upload.ts
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() }); // in-memory upload

export default upload;
