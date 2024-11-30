import path from "path"
import * as dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "../../.env") })

const SERVER = {
  hostName: process.env.SERVER_HOSTNAME,
  port: process.env.SERVER_PORT
}
const API = {
  prefix: process.env.API_PREFIX || ""
}

const MONGO_USERNAME = process.env.MONGO_USERNAME ?? ""
const MONGO_PASSWORD = process.env.MONGO_PASSWORD ?? ""
const MONGO_HOST =
    process.env.MONGO_URL ||
    `mongodb://127.0.0.1:27017/${process.env.MONGO_DB_NAME}`

const MONGO = {
  host: MONGO_HOST,
  username: MONGO_USERNAME,
  password: MONGO_PASSWORD,
  url:
      MONGO_USERNAME !== "" && MONGO_PASSWORD !== ""
          ? `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`
          : `${MONGO_HOST}`,
}

const config = {
  SERVER,
  API,
  MONGO,
 }

export default config