"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendSuccess = (res, data, message = 'Success', statusCode = http_status_codes_1.default.OK) => {
    return res.status(statusCode).json({
        status: true,
        message,
        data
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message = 'Error', statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR) => {
    return res.status(statusCode).json({
        status: false,
        message
    });
};
exports.sendError = sendError;
