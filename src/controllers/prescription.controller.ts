import {Request, Response} from "express";
import HttpStatusCode from "http-status-codes";
import {sendError, sendSuccess} from "../utilities/responseHandler";
import prescriptionModel from "../models/eprescriptions/prescription.model";
import appointmentModel from "../models/appointments/appointmentModel";
import {AppointmentStatus} from "../interfaces/appointments.interface";

/**
 * Doctor writes the medicines and treatment statement after a consultation.
 *
 * The doctor is taken from the token and the patient from the appointment, never
 * from the request body. Previously both ids came from the body with no check, so
 * any logged-in user - including a patient - could write a prescription for anyone.
 * Writing one completes the appointment.
 */
const addPrescription = async (req: Request, res: Response) => {
    try {
        const doctorId = (req as any).user._id;
        const {appointmentId, patientName, age, symptoms, diagnosis, medications, notes, date} = req.body;

        if (!appointmentId) {
            return sendError(res, 'appointmentId is required', HttpStatusCode.BAD_REQUEST);
        }
        if (!Array.isArray(medications) || medications.length === 0) {
            return sendError(res, 'At least one medication is required', HttpStatusCode.BAD_REQUEST);
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return sendError(res, 'Appointment not found', HttpStatusCode.NOT_FOUND);
        }
        if (appointment.doctor?.toString() !== doctorId.toString()) {
            return sendError(res, 'You can only write prescriptions for your own appointments', HttpStatusCode.FORBIDDEN);
        }

        const prescribable = [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED];
        if (!prescribable.includes(appointment.status)) {
            return sendError(res, `Cannot prescribe for an appointment that is ${appointment.status}`, HttpStatusCode.BAD_REQUEST);
        }

        const prescriptionData = await prescriptionModel.create({
            appointmentId,
            patientId: appointment.bookedBy,
            doctorId,
            patientName,
            age,
            symptoms,
            diagnosis,
            medications,
            notes,
            date: date ? new Date(date) : new Date()
        });

        if (appointment.status !== AppointmentStatus.COMPLETED) {
            appointment.status = AppointmentStatus.COMPLETED;
            appointment.expiresAt = undefined;
            await appointment.save();
        }

        return sendSuccess(res, prescriptionData, 'Prescription added successfully', HttpStatusCode.CREATED);

    } catch (error: any) {
        return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
    }
};

/** The logged-in patient's prescriptions, newest first. */
const getPrescriptionDetails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        // Include the prescribing doctor's name so the app and the PDF can show it;
        // the record itself only stores the id.
        const records = await prescriptionModel
            .find({patientId: userId})
            .sort({date: -1})
            .populate('doctorId', 'fullName')
            .lean();
        const prescriptionDetails = records.map((p: any) => ({
            ...p,
            id: String(p._id),
            doctorId: p.doctorId?._id ? String(p.doctorId._id) : p.doctorId,
            doctorName: p.doctorId?.fullName ?? null,
        }));
        return sendSuccess(res, prescriptionDetails, 'Prescription Details fetched successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
    }
};

export default {addPrescription, getPrescriptionDetails};
