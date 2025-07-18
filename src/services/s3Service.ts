import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AWS_BUCKET_NAME!;
const s3BaseUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com`;

export const uploadFileToS3 = async (file: Express.Multer.File): Promise<string> => {
    const extension = path.extname(file.originalname);
    const key = `profile-images/${uuidv4()}${extension}`;

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));
    return `${s3BaseUrl}/${key}`;
};
