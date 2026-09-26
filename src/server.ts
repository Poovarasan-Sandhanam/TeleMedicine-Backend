import express, { Request, Response } from "express";
import config from "./configurations/config";
import routes from "./routes/index.route";
import mongoose from "mongoose";
import logging from "./utilities/logging";
import { handleError } from "./utilities/errorHandler";
import path from "path";

const app = express();

const NAMESPACE = "Server";

// app.use(express.json());
app.use(express.json({
  // We need the raw body to verify webhook signatures.
  // Let's compute it only when hitting the Stripe webhook endpoint.
  verify: function (req: any, res: Response, buf: Buffer) {
    if (req.originalUrl.includes("/webhook")) {
      req.rawBody = buf.toString();
    }
  }
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});


app.use((req, res, next) => {
  /** Log the req */
  logging.info(
    NAMESPACE,
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );

  res.on("finish", () => {
    /** Log the res */
    logging.info(
      NAMESPACE,
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });

  next();
});

const prefix = config.API.prefix;

mongoose
  .connect(config.MONGO.url)
  .then(async () => {
    logging.info(NAMESPACE, "Mongo Connected");
  })
  .catch((error: any) => {
    logging.error(NAMESPACE, error.message, error);
  });

mongoose.Promise = global.Promise;
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Telemedicine!",
  });
});

/**
 * Liveness/readiness probe for the container platform. Reports 503 while Mongo is
 * not connected so a broken instance is replaced rather than served traffic.
 * mongoose.connection.readyState: 1 = connected, 2 = connecting.
 */
app.get("/health", (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const healthy = dbState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    database: dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected",
    uptime: Math.round(process.uptime()),
  });
});

/* routes */
app.use(prefix, routes);
app.use(handleError);


app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    message: "Route Not Found!",
  });
});


app.listen(config.SERVER.port, () => {
  console.info(
    `Server is listening at ${config.SERVER.hostName}:${config.SERVER.port}`
  );
});
