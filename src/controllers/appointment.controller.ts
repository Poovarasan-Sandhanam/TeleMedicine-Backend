import {Request, Response} from "express"

import HttpStatusCode from "http-status-codes"
import {sendError, sendSuccess} from "../utilities/responseHandler";
import appointmentModel from "../models/appointments/appointmentModel";
import userModel from "../models/user/user.model";
import CustomError from "../utilities/customError";


const bookAppointment = async (req: Request, res: Response) => {
    try {
        const { healthIssues, checkupTiming, doctor, notes } = req.body;
        const userId = ( req as any ).user._id

        const userDetails = await userModel.findOne({_id: userId});

        if (userDetails?.isDoctor) {
            throw new CustomError('Only users are allowed to book the appointment', HttpStatusCode.UNPROCESSABLE_ENTITY)
        }

        const appointmentDetails = await appointmentModel.create({
            healthIssues, checkupTiming, doctor, notes, bookedBy: userId
        })

        // Return success response with updated details
        return sendSuccess(res, appointmentDetails, 'Appointment booked successfully', HttpStatusCode.CREATED);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

const getAllDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await userModel.find({isDoctor: true});
        return sendSuccess(res, doctors, 'Doctor List Fetched Successfully', HttpStatusCode.OK);
    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

export default {bookAppointment,getAllDoctors}
