import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError, sendSuccess } from "../utilities/responseHandler";
import DoctorType from "../models/doctor/doctorType.model";

// Predefined doctor categories
const DOCTOR_CATEGORIES = [
  { id: 'general', title: 'General Practitioner', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/general.png' },
  { id: 'cardiologist', title: 'Cardiologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Cardiologist.png' },
  { id: 'pediatrician', title: 'Pediatrician', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Pediatrician.jpg' },
  { id: 'orthopedic', title: 'Orthopedic Surgeon', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Orthopedic.jpg' },
  { id: 'gynecologist', title: 'Gynecologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Gynecologist.jpg' },
  { id: 'obstetrician', title: 'Obstetrician (OB)', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Obstetrician.jpg' },
  { id: 'dermatologist', title: 'Dermatologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Dermatologist.jpg' },
  { id: 'endocrinologist', title: 'Endocrinologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Endocrinologist.jpg' },
  { id: 'neurologist', title: 'Neurologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Neurologist.jpg' },
  { id: 'psychiatrist', title: 'Psychiatrist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Psychiatrist.jpg' },
  { id: 'gastroenterologist', title: 'Gastroenterologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Gastroenterologist.jpeg' },
  { id: 'pulmonologist', title: 'Pulmonologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Pulmonologist.jpg' },
  { id: 'oncologist', title: 'Oncologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Oncologist.jpg' },
  { id: 'ophthalmologist', title: 'Ophthalmologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Ophthalmologist.jpg' },
  { id: 'urologist', title: 'Urologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Urologist.jpg' },
];

// GET all doctor types
export const getDoctorTypes = async (req: Request, res: Response) => {
  try {
    let doctorTypes = await DoctorType.find({});

    // Auto-seed if empty
    if (doctorTypes.length === 0) {
      await DoctorType.insertMany(DOCTOR_CATEGORIES);
      doctorTypes = await DoctorType.find({});
    }

    return sendSuccess(res, doctorTypes, "Doctor Types fetched successfully", HttpStatusCode.OK);
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

