import {Request, Response} from "express"

import HttpStatusCode from "http-status-codes"
import userService from "../services/user.service"
import bcrypt from 'bcryptjs'
import {generateToken} from '../utilities/jwt'
import {sendError, sendSuccess} from "../utilities/responseHandler";

const register = async (req: Request, res: Response) => {
    try {
        let {email, password, dob, contactNo, fullName, gender, isDoctor, doctorType} = req.body
        const existingUser = await userService.getUserDetails({email})
        if (existingUser) {
            return sendError(res, 'You are already registered! Please login', HttpStatusCode.UNPROCESSABLE_ENTITY)
        }

        // save new request
        const hashedPassword = await bcrypt.hash(password, 12)
        const result = await userService.saveUserDetails({
            email,
            password: hashedPassword,
            dob,
            contactNo,
            fullName,
            gender,
            isDoctor,
            doctorType
        })

        return sendSuccess(res, {email}, 'You are registered successfully', HttpStatusCode.OK);
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
        const userDetails = {
            email: user.email,
            fullName: user.fullName,
            isDoctor: user.isDoctor
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

export default {register, login}
