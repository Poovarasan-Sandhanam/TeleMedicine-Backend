import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError, sendSuccess } from "../utilities/responseHandler";
import userService from "../services/user.service";
import doctorProfileModel from "../models/user/doctorProfile.model";
import patientProfileModel from "../models/user/patientProfile.model";
import { uploadToS3 } from "../utilities/s3Uploader";
import { UserRole, DoctorSpecialization } from "../interfaces/user.interface";
import { FilterQuery } from "mongoose";
import { IDoctorProfile } from "../interfaces/doctorProfile.interface";
import { IPatientProfile } from "../interfaces/patientProfile.interface";

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const userData = await userService.getUserDetails({ _id: userId });

    if (!userData) return sendError(res, 'User not found', HttpStatusCode.NOT_FOUND);

    const isUserDoctor = userData.role === UserRole.DOCTOR || userData.isDoctor;
    const imageUrl = req.file ? await uploadToS3(req.file) : null;

    if (isUserDoctor) {
      const {
        name, age, contactNumber, address, specialization,
        experience, consultationTiming, licenseNumber,
        education, certifications, languages
      } = req.body;

      for (const field of [name, age, contactNumber, address, specialization, experience, consultationTiming]) {
        if (!field) return sendError(res, `Field ${field} is required for doctors`, HttpStatusCode.BAD_REQUEST);
      }

      if (!Object.values(DoctorSpecialization).includes(specialization)) {
        return sendError(res, 'Invalid specialization', HttpStatusCode.BAD_REQUEST);
      }

      const updatedProfile = await doctorProfileModel.updateOne(
        { userId },
        {
          name,
          age,
          contactNumber,
          address,
          specialization,
          experience,
          consultationTiming,
          licenseNumber,
          education,
          certifications: certifications ? certifications.split(',') : [],
          languages: languages ? languages.split(',') : [],
          ...(imageUrl && { profileImage: imageUrl }),
        },
        { upsert: true }
      );

      return sendSuccess(res, updatedProfile, 'Doctor profile updated successfully');
    }

    // Patient
    const {
      name, age, bloodGroup, weight, height,
      ongoingTreatment, healthIssues, contactNumber,
      address, allergies
    } = req.body;

    for (const field of [name, age, bloodGroup, weight, height, contactNumber, address]) {
      if (!field) return sendError(res, `Field ${field} is required for patients`, HttpStatusCode.BAD_REQUEST);
    }

    const updatedProfile = await patientProfileModel.updateOne(
      { userId },
      {
        name,
        age,
        bloodGroup,
        weight,
        height,
        ongoingTreatment,
        healthIssues: healthIssues ? healthIssues.split(',') : [],
        contactNumber,
        address,
        allergies: allergies ? allergies.split(',') : [],
        ...(imageUrl && { profileImage: imageUrl }),
      },
      { upsert: true }
    );

    return sendSuccess(res, updatedProfile, 'Patient profile updated successfully');
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const userData = await userService.getUserDetails({ _id: userId });

    if (!userData) return sendError(res, 'User not found', HttpStatusCode.NOT_FOUND);

    const isUserDoctor = userData.role === UserRole.DOCTOR || userData.isDoctor;

    let profileData: any;

    if (isUserDoctor) {
      const profile = await doctorProfileModel.findOne({ userId } as FilterQuery<IDoctorProfile>);
      profileData = profile ? { ...userData.toObject(), ...profile.toObject() } : userData.toObject();
    } else {
      const profile = await patientProfileModel.findOne({ userId } as FilterQuery<IPatientProfile>);
      profileData = profile ? { ...userData.toObject(), ...profile.toObject() } : userData.toObject();
    }

    return sendSuccess(res, profileData, 'Profile fetched successfully');
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

const getDoctorTypes = async (_req: Request, res: Response) => {
  try {
    return sendSuccess(res, Object.values(DoctorSpecialization), 'Doctor types fetched successfully');
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

export default { updateProfile, getProfile, getDoctorTypes };
