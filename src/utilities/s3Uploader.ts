// utils/s3Uploader.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  try {
    const fileKey = `profile-images/${Date.now()}-${file.originalname}`;

   const command = new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME!,
  Key: fileKey,
  Body: file.buffer,
  ContentType: file.mimetype,
});


    await s3.send(command);

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  } catch (err: any) {
    console.error("S3 upload failed:", err); // ⛳ add this
    throw new Error("S3 upload failed: " + err.message);
  }
};

