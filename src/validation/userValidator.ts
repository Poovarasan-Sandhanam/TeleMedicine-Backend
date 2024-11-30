import {body, param} from 'express-validator';
import {Request, Response, NextFunction} from 'express';
import {handleValidationResult} from "../utilities/errorHandler";


export const validateUserRegisterSchema = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('isDoctor')
        .optional({ nullable: true, checkFalsy: true })
        .isBoolean().withMessage('Doctor status must be a boolean'),

    body('doctorType')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Doctor Type must be a string'),

    body('gender')
        .optional({ nullable: true, checkFalsy: true })
        .isString().withMessage('Gender must be a string'),

    body('dob')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601().withMessage('Date of birth must be a valid date'),

    body('contactNo')
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric().withMessage('Contact Number be a Integer'),

    body('fullName')
        .notEmpty().withMessage('Full Name is required')
        .isString().withMessage('Full Name must be a string'),

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
