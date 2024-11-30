"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserLoginSchema = exports.validateUserRegisterSchema = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../utilities/errorHandler");
exports.validateUserRegisterSchema = [
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('isDoctor')
        .optional({ nullable: true, checkFalsy: true })
        .isBoolean().withMessage('Doctor status must be a boolean'),
    (0, express_validator_1.body)('doctorType')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Doctor Type must be a string'),
    (0, express_validator_1.body)('gender')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Gender must be a string'),
    (0, express_validator_1.body)('dob')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601().withMessage('Date of birth must be a valid date'),
    (0, express_validator_1.body)('contactNo')
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric().withMessage('Contact Number be a Integer'),
    (0, express_validator_1.body)('fullName')
        .notEmpty().withMessage('Full Name is required')
        .isString().withMessage('Full Name must be a string'),
    (req, res, next) => {
        (0, errorHandler_1.handleValidationResult)(req, res, next);
    }
];
exports.validateUserLoginSchema = [
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (req, res, next) => {
        (0, errorHandler_1.handleValidationResult)(req, res, next);
    }
];
