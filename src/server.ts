import express, { Request, Response, RequestHandler, ErrorRequestHandler } from "express";
import config from "./configurations/config";
import routes from "./routes/index.route";
import mongoose from "mongoose";
import logging from "./utilities/logging";

const app = express();
const NAMESPACE = "Server";

app.use(express.json());

// Middleware to handle CORS
app.use(((req, res, next) => {
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
}) as RequestHandler);

// Middleware for logging requests
app.use(((req, res, next) => {
  logging.info(
    NAMESPACE,
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );

  res.on("finish", () => {
    logging.info(
      NAMESPACE,
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });

  next();
}) as RequestHandler);

// Connect to MongoDB
mongoose
  .connect(config.MONGO.url)
  .then(() => logging.info(NAMESPACE, "Mongo Connected"))
  .catch((error) => logging.error(NAMESPACE, error.message, error));

mongoose.Promise = global.Promise;

// Test route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to Telemedicine!" });
});

// API routes
app.use(config.API.prefix, routes);

// Error handling middleware
const handleError: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || "An error occurred",
  });
};

app.use(handleError);

// Catch-all for undefined routes
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Route Not Found!" });
});

// Start server
app.listen(config.SERVER.port, () => {
  console.info(
    `Server is listening at ${config.SERVER.hostName}:${config.SERVER.port}`
  );
});
