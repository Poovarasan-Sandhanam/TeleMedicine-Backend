"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./configurations/config"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const mongoose_1 = __importDefault(require("mongoose"));
const logging_1 = __importDefault(require("./utilities/logging"));
const errorHandler_1 = require("./utilities/errorHandler");
// import './@types/express/index.d.ts'
const app = (0, express_1.default)();
const NAMESPACE = "Server";
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});
app.use((req, res, next) => {
    /** Log the req */
    logging_1.default.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on("finish", () => {
        /** Log the res */
        logging_1.default.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });
    next();
});
mongoose_1.default
    .connect(config_1.default.MONGO.url)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    logging_1.default.info(NAMESPACE, "Mongo Connected");
}))
    .catch((error) => {
    logging_1.default.error(NAMESPACE, error.message, error);
});
mongoose_1.default.Promise = global.Promise;
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Telemedicine!",
    });
});
/* routes */
let prefix = config_1.default.API.prefix;
app.use(prefix, index_route_1.default);
app.use(errorHandler_1.handleError);
app.all("*", (req, res) => {
    res.status(404).json({
        message: "Route Not Found!",
    });
});
app.listen(config_1.default.SERVER.port, () => {
    console.info(`Server is listening at ${config_1.default.SERVER.hostName}:${config_1.default.SERVER.port}`);
});
