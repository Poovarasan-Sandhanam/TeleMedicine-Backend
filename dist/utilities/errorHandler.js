"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.handleValidationResult = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const customError_1 = __importDefault(require("./customError"));
const responseHandler_1 = require("./responseHandler");
const express_validator_1 = require("express-validator");
const handleValidationResult = (req, res, next) => {
    var _a;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMsg = ((_a = errors.array()[0]) === null || _a === void 0 ? void 0 : _a.msg) || 'Validation error';
        return (0, responseHandler_1.sendError)(res, errorMsg, http_status_codes_1.default.UNPROCESSABLE_ENTITY);
    }
    next();
};
exports.handleValidationResult = handleValidationResult;
const handleError = (err, req, res, next) => {
    if (err instanceof customError_1.default) {
        return (0, responseHandler_1.sendError)(res, err.message, err.statusCode);
    }
    return (0, responseHandler_1.sendError)(res, 'Internal Server Error', http_status_codes_1.default.INTERNAL_SERVER_ERROR);
};
exports.handleError = handleError;
