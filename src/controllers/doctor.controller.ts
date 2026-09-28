import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError, sendSuccess } from "../utilities/responseHandler";
import DoctorType from "../models/doctor/doctorType.model";
import { DoctorSpecialization } from "../interfaces/user.interface";

// Predefined doctor categories. `specialization` is the exact value a doctor's
// profile stores; the tile `id` and `title` are only for display.
export const DOCTOR_CATEGORIES = [
  { id: 'general', title: 'General Practitioner', specialization: DoctorSpecialization.GENERAL_PRACTITIONER, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/general.png' },
  { id: 'cardiologist', title: 'Cardiologist', specialization: DoctorSpecialization.CARDIOLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Cardiologist.png' },
  { id: 'pediatrician', title: 'Pediatrician', specialization: DoctorSpecialization.PEDIATRICIAN, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Pediatrician.jpg' },
  { id: 'orthopedic', title: 'Orthopedic Surgeon', specialization: DoctorSpecialization.ORTHOPEDIC_SURGEON, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Orthopedic.jpg' },
  { id: 'gynecologist', title: 'Gynecologist', specialization: DoctorSpecialization.GYNECOLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Gynecologist.jpg' },
  { id: 'obstetrician', title: 'Obstetrician (OB)', specialization: DoctorSpecialization.OBSTETRICIAN, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Obstetrician.jpg' },
  { id: 'dermatologist', title: 'Dermatologist', specialization: DoctorSpecialization.DERMATOLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Dermatologist.jpg' },
  { id: 'endocrinologist', title: 'Endocrinologist', specialization: DoctorSpecialization.ENDOCRINOLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Endocrinologist.jpg' },
  { id: 'neurologist', title: 'Neurologist', specialization: DoctorSpecialization.NEUROLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Neurologist.jpg' },
  { id: 'psychiatrist', title: 'Psychiatrist', specialization: DoctorSpecialization.PSYCHIATRIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Psychiatrist.jpg' },
  { id: 'gastroenterologist', title: 'Gastroenterologist', specialization: DoctorSpecialization.GASTROENTEROLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Gastroenterologist.jpeg' },
  { id: 'pulmonologist', title: 'Pulmonologist', specialization: DoctorSpecialization.PULMONOLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Pulmonologist.jpg' },
  { id: 'oncologist', title: 'Oncologist', specialization: DoctorSpecialization.ONCOLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Oncologist.jpg' },
  { id: 'ophthalmologist', title: 'Ophthalmologist', specialization: DoctorSpecialization.OPHTHALMOLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Ophthalmologist.jpg' },
  { id: 'urologist', title: 'Urologist', specialization: DoctorSpecialization.UROLOGIST, image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Urologist.jpg' },
];

/**
 * Turn whatever the client sent into a valid DoctorSpecialization, or null.
 *
 * The app's specialty picker is fed by the doctor-type tiles, so older builds send
 * the tile id ("cardiologist", "general") or title ("General Practitioner"), none of
 * which matched the enum - every doctor profile save from the app was rejected.
 */
export const resolveSpecialization = (input: unknown): DoctorSpecialization | null => {
  if (typeof input !== "string" || input.trim() === "") return null;
  const value = input.trim();
  const enumValues = Object.values(DoctorSpecialization) as string[];

  if (enumValues.includes(value)) return value as DoctorSpecialization;

  const lower = value.toLowerCase();
  const category = DOCTOR_CATEGORIES.find(
    c => c.id === lower || c.title.toLowerCase() === lower
  );
  if (category) return category.specialization;

  const caseInsensitive = enumValues.find(v => v.toLowerCase() === lower);
  return (caseInsensitive as DoctorSpecialization) ?? null;
};

// GET all doctor types
export const getDoctorTypes = async (req: Request, res: Response) => {
  try {
    let doctorTypes = await DoctorType.find({});

    // Auto-seed if empty
    if (doctorTypes.length === 0) {
      await DoctorType.insertMany(DOCTOR_CATEGORIES);
      doctorTypes = await DoctorType.find({});
    }

    const withSpecialization = doctorTypes.map(t => {
      const plain: any = t.toObject();
      plain.specialization = resolveSpecialization(plain.id) ?? resolveSpecialization(plain.title);
      return plain;
    });

    return sendSuccess(res, withSpecialization, "Doctor Types fetched successfully", HttpStatusCode.OK);
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

