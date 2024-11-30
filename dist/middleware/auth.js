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
const user_model_ts_1 = __importDefault(require("../models/user/user.model.ts"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jwt_1 = require("../utilities/jwt");
const JWT_SECRET = fs_1.default.readFileSync(path_1.default.join(__dirname, "../../private.key"), "utf8");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = (0, jwt_1.verifyToken)(token);
            let userDetails = yield user_model_ts_1.default.findById(decoded.id).select('-password');
            req.user = (yield user_model_ts_1.default.findById(decoded.id).select('-password'));
            next();
        }
        catch (error) {
            return res.status(http_status_codes_1.default.UNAUTHORIZED).send({
                status: false,
                message: 'Not authorized, token failed',
            });
        }
    }
    if (!token) {
        return res.status(http_status_codes_1.default.UNAUTHORIZED).send({
            status: false,
            message: 'Not authorized, no token',
        });
    }
});
exports.default = auth;
