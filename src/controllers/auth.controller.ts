import {Request, Response} from "express"
import HttpStatusCode from "http-status-codes"
import userService from "../services/user.service"
import bcrypt from 'bcryptjs'
import {generateToken} from '../utilities/jwt'
import {sendError, sendSuccess} from "../utilities/responseHandler";
import { UserRole } from "../interfaces/user.interface";

const register = async (req: Request, res: Response) => {
    try {
        let {
            email, 
            password, 
            confirmPassword,
            fullName, 
            role,
            // Legacy fields for backward compatibility
            isDoctor
        } = req.body

        // Validate password confirmation
        if (password !== confirmPassword) {
            return sendError(res, 'Password and confirm password do not match', HttpStatusCode.BAD_REQUEST);
        }

        const existingUser = await userService.getUserDetails({email})
        if (existingUser) {
            return sendError(res, 'You are already registered! Please login', HttpStatusCode.UNPROCESSABLE_ENTITY)
        }

        // Handle backward compatibility
        let userRole = role;

        // If using legacy fields, convert to new system
        if (isDoctor !== undefined && role === undefined) {
            userRole = isDoctor ? UserRole.DOCTOR : UserRole.PATIENT;
        }

        // Validate role
        if (!userRole || !Object.values(UserRole).includes(userRole)) {
            return sendError(res, 'Valid role is required (DOCTOR or PATIENT)', HttpStatusCode.BAD_REQUEST);
        }

        // save new request
        const hashedPassword = await bcrypt.hash(password, 12)
        const result = await userService.saveUserDetails({
            email,
            password: hashedPassword,
            fullName,
            role: userRole,
            // Legacy fields for backward compatibility
            isDoctor: userRole === UserRole.DOCTOR
        })

        return sendSuccess(res, {email, fullName, role: userRole}, 'You are registered successfully', HttpStatusCode.OK);
    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

const login = async (req: Request, res: Response) => {
    const {email, password} = req.body
    try {
        const user: any = await userService.getUserDetails({email})

        if (!user) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: 'You are not registered, Please register!',
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: 'Invalid credentials',
            })
        }

        const token = generateToken(user._id)
        
        // Return both new and legacy fields for backward compatibility
        const userDetails = {
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            // Legacy fields
            isDoctor: user.isDoctor || user.role === UserRole.DOCTOR
        }
        
        return res.status(HttpStatusCode.OK).send({
            status: true,
            data: {...userDetails, token},
            message: "Login successful!",
        })

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

// New endpoint to get doctor specializations
const getDoctorSpecializations = async (req: Request, res: Response) => {
    try {
        const specializations = [
            "General Practitioner (GP)",
            "Cardiologist",
            "Pediatrician",
            "Orthopedic Surgeon",
            "Gynecologist",
            "Obstetrician (OB)",
            "Dermatologist",
            "Endocrinologist",
            "Neurologist",
            "Psychiatrist",
            "Gastroenterologist",
            "Pulmonologist",
            "Oncologist",
            "Ophthalmologist",
            "Urologist",
        ];
        return sendSuccess(res, specializations, 'Doctor specializations fetched successfully', HttpStatusCode.OK);
    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
}

export default {register, login, getDoctorSpecializations}
