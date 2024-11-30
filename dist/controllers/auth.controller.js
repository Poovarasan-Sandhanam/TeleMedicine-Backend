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
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_service_1 = __importDefault(require("../services/user.service"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utilities/jwt");
const responseHandler_1 = require("../utilities/responseHandler");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, password, dob, contactNo, fullName, gender } = req.body;
        const existingUser = yield user_service_1.default.getUserDetails({ email });
        if (existingUser) {
            return (0, responseHandler_1.sendError)(res, 'You are already registered! Please login', http_status_codes_1.default.UNPROCESSABLE_ENTITY);
        }
        // save new request
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const result = yield user_service_1.default.saveUserDetails({
            email,
            password: hashedPassword,
            dob,
            contactNo,
            fullName,
            gender
        });
        return (0, responseHandler_1.sendSuccess)(res, { email }, 'You are registered successfully', http_status_codes_1.default.OK);
    }
    catch (error) {
        return res.status(http_status_codes_1.default.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_service_1.default.getUserDetails({ email });
        if (!user) {
            return res.status(http_status_codes_1.default.BAD_REQUEST).send({
                status: false,
                message: 'You are not registered, Please register!',
            });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(http_status_codes_1.default.BAD_REQUEST).send({
                status: false,
                message: 'Invalid credentials',
            });
        }
        const token = (0, jwt_1.generateToken)(user._id);
        const userDetails = {
            email: user.email,
        };
        return res.status(http_status_codes_1.default.OK).send({
            status: true,
            data: Object.assign(Object.assign({}, userDetails), { token }),
            message: "Login successful!",
        });
    }
    catch (error) {
        return res.status(http_status_codes_1.default.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
});
exports.default = { register, login };
