import {Request, Response} from "express";
import HttpStatusCode from "http-status-codes";
import {sendError, sendSuccess} from "../utilities/responseHandler";
import userService from "../services/user.service";
import prescriptionModel from "../models/eprescriptions/prescription.model";


const addPrescription  = async (req: Request, res: Response) => {
    try {
        const {
            patientId,
            doctorId,
            patientName,
            age,
            symptoms,
            diagnosis,
            medications,
            notes,
            date
        } = req.body;

        const existingPatient = await userService.getUserDetails({_id: patientId});
        if (!existingPatient) {
            return sendError(res, 'Patient not found', HttpStatusCode.NOT_FOUND);
        }
        const existingDoctor = await userService.getUserDetails({_id: doctorId});
        if (!existingDoctor) {
            return sendError(res, 'Doctor not found', HttpStatusCode.NOT_FOUND);
        }

        const prescriptionData = await prescriptionModel.create({
            patientId,
            doctorId,
            patientName,
            age,
            symptoms,
            diagnosis,
            medications,
            notes,
            date
        })

        return sendSuccess(res, prescriptionData, 'Prescription added successfully', HttpStatusCode.CREATED);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};


const getPrescriptionDetails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const prescriptionDetails = await prescriptionModel.find({patientId: userId});
        return sendSuccess(res, prescriptionDetails, 'Prescription Details fetched successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

export default {addPrescription, getPrescriptionDetails};