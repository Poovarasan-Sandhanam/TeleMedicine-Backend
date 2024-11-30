"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const express_validator_1 = require("express-validator");
const getISOTimestamp = (increaseDays = 0) => {
    try {
        // Get the current UTC time
        const currentUtcTime = moment_1.default.utc();
        // Add two days to the current UTC time
        const futureUtcTime = currentUtcTime.add(increaseDays, 'days');
        return futureUtcTime.valueOf();
    }
    catch (error) {
        throw new Error(error);
    }
};
const validateRequest = (req, res, next) => {
    var _a;
    //checking for validation errors
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ status: false, message: (_a = errors.array()[0]) === null || _a === void 0 ? void 0 : _a.msg });
    else
        next();
};
const isFloat = (x) => {
    return !!(x % 1);
};
const getTotalPages = (totalData, perPage) => {
    const totalPage = totalData / perPage;
    let totalPages = 1;
    if (totalPage > 1)
        totalPages = totalPage;
    if (isFloat(totalPages)) {
        totalPages = parseInt(totalPages) + 1;
    }
    return totalPages;
};
exports.default = { getISOTimestamp, validateRequest, getTotalPages };
