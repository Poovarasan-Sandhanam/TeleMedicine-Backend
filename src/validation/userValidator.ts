import {body, param} from 'express-validator';
import {Request, Response, NextFunction} from 'express';
import {handleValidationResult} from "../utilities/errorHandler";
import { UserRole } from "../interfaces/user.interface";

export const validateUserRegisterSchema = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('confirmPassword')
        .notEmpty().withMessage('Confirm password is required')
        .isString().withMessage('Confirm password must be a string')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password and confirm password do not match');
            }
            return true;
        }),

    body('fullName')
        .notEmpty().withMessage('Full Name is required')
        .isString().withMessage('Full Name must be a string')
        .isLength({ min: 2 }).withMessage('Full Name must be at least 2 characters'),

    // New role system
    body('role')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(Object.values(UserRole)).withMessage('Role must be DOCTOR or PATIENT'),

    // Legacy fields for backward compatibility
    body('isDoctor')
        .optional({ nullable: true, checkFalsy: true })
        .isBoolean().withMessage('Doctor status must be a boolean'),

    (req: Request, res: Response, next: NextFunction) => {
        handleValidationResult(req, res, next);
    }
];

export const validateUserLoginSchema = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    (req: Request, res: Response, next: NextFunction) => {
        handleValidationResult(req, res, next);
    }
];
