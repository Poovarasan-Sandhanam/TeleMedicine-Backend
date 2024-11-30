import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import bcrypt from 'bcryptjs';
import userService from "../services/user.service";
import { generateToken } from '../utilities/jwt';
import { sendError, sendSuccess } from "../utilities/responseHandler";

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        let { email, password, dob, contactNo, fullName, gender } = req.body;

        const existingUser = await userService.getUserDetails({ email });
        if (existingUser) {
            // Instead of returning, just call sendError
            sendError(res, 'You are already registered! Please login', HttpStatusCode.UNPROCESSABLE_ENTITY);
            return; // This ensures that no further code is executed after sending the error.
        }

        // Hash password and save user details
        const hashedPassword = await bcrypt.hash(password, 12);
        await userService.saveUserDetails({
            email,
            password: hashedPassword,
            dob,
            contactNo,
            fullName,
            gender
        });

        // Send success response using sendSuccess
        sendSuccess(res, { email }, 'You are registered successfully', HttpStatusCode.OK);
    } catch (error: any) {
        // Instead of returning, handle error and send response directly
        res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user: any = await userService.getUserDetails({ email });

        if (!user) {
            // Instead of returning, just call res.status().send()
            res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: 'You are not registered, Please register!',
            });
            return;
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Instead of returning, handle error and send response directly
            res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Generate token
        const token = generateToken(user._id);
        const userDetails = {
            email: user.email,
        };

        // Instead of returning, send success response directly
        res.status(HttpStatusCode.OK).send({
            status: true,
            data: { ...userDetails, token },
            message: 'Login successful!',
        });
    } catch (error: any) {
        // Instead of returning, handle error and send response directly
        res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

export default { register, login };
