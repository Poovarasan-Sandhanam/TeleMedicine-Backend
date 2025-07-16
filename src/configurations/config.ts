import path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const SERVER = {
  hostName: process.env.SERVER_HOSTNAME,
  port: process.env.SERVER_PORT,
};

const API = {
  prefix: process.env.API_PREFIX || "",
};

const MONGO_USERNAME = process.env.MONGO_USERNAME ?? "";
const MONGO_PASSWORD = process.env.MONGO_PASSWORD ?? "";
const MONGO_HOST =
  process.env.MONGO_URL ||
  `127.0.0.1:27017/${process.env.MONGO_DB_NAME}`;

const MONGO = {
  host: MONGO_HOST,
  username: MONGO_USERNAME,
  password: MONGO_PASSWORD,
  url:
    MONGO_USERNAME !== "" && MONGO_PASSWORD !== ""
      ? `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`
      : `mongodb://${MONGO_HOST}`,
};

const AWS_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  region: process.env.AWS_REGION || "us-east-1",
  bucketName: process.env.AWS_S3_BUCKET_NAME || "",
};

const config = {
  SERVER,
  API,
  MONGO,
  AWS: AWS_CONFIG,
};

export default config;
