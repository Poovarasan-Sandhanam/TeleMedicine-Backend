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
import UserModel from "../models/user/user.model"; // make sure path is correct

/**
 * Update profile for doctor or patient
 */
const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const userData = await userService.getUserDetails({ _id: userId });
    if (!userData) return sendError(res, "User not found", HttpStatusCode.NOT_FOUND);

    const isDoctor = userData.role === UserRole.DOCTOR || userData.isDoctor;
    const imageUrl = req.file ? await uploadToS3(req.file) : undefined;

    if (isDoctor) {
      const {
        name, age, contactNumber, address, specialization,
        experience, consultationTiming, licenseNumber,
        education, certifications, languages, gender
      } = req.body;

      // Validate required fields
      for (const [key, value] of Object.entries({
        name, age, contactNumber, address, specialization, gender, experience, consultationTiming
      })) {
        if (!value) return sendError(res, `Field ${key} is required for doctors`, HttpStatusCode.BAD_REQUEST);
      }

      if (!Object.values(DoctorSpecialization).includes(specialization)) {
        return sendError(res, "Invalid specialization", HttpStatusCode.BAD_REQUEST);
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
          gender,
          licenseNumber,
          education,
          certifications: certifications ? certifications.split(",") : [],
          languages: languages ? languages.split(",") : [],
          ...(imageUrl && { profileImage: imageUrl }),
        },
        { upsert: true }
      );

      return sendSuccess(res, updatedProfile, "Doctor profile updated successfully");
    } else {
      // Patient profile
      const {
        name, age, bloodGroup, weight, height,
        ongoingTreatment, healthIssues, contactNumber,
        address, allergies, gender
      } = req.body;

      for (const [key, value] of Object.entries({
        name, age, bloodGroup, gender, weight, height, contactNumber, address
      })) {
        if (!value) return sendError(res, `Field ${key} is required for patients`, HttpStatusCode.BAD_REQUEST);
      }

      const updatedProfile = await patientProfileModel.updateOne(
        { userId },
        {
          name,
          age,
          bloodGroup,
          weight,
          height,
          gender,
          ongoingTreatment,
          healthIssues: healthIssues ? healthIssues.split(",") : [],
          contactNumber,
          address,
          allergies: allergies ? allergies.split(",") : [],
          ...(imageUrl && { profileImage: imageUrl }),
        },
        { upsert: true }
      );

      return sendSuccess(res, updatedProfile, "Patient profile updated successfully");
    }
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

/**
 * Get profile of logged-in user
 */
const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const userData = await userService.getUserDetails({ _id: userId });
    if (!userData) return sendError(res, "User not found", HttpStatusCode.NOT_FOUND);

    const isDoctor = userData.role === UserRole.DOCTOR || userData.isDoctor;
    let profileData: any;

    if (isDoctor) {
      const profile = await doctorProfileModel.findOne({ userId } as FilterQuery<IDoctorProfile>);
      profileData = profile ? { ...userData.toObject(), ...profile.toObject() } : userData.toObject();
    } else {
      const profile = await patientProfileModel.findOne({ userId } as FilterQuery<IPatientProfile>);
      profileData = profile ? { ...userData.toObject(), ...profile.toObject() } : userData.toObject();
    }

    return sendSuccess(res, profileData, "Profile fetched successfully");
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

/**
 * Get all doctors who have completed their profiles
 */
const getCompletedDoctorProfiles = async (req: Request, res: Response) => {
  try {
    // Define required fields for a "completed" doctor profile
    const requiredFields = [
      "name",
      "age",
      "contactNumber",
      "address",
      "specialization",
      "experience",
      "consultationTiming",
      "gender",
      "licenseNumber"
    ];

    // Query doctors with all required fields filled
    const doctors = await doctorProfileModel.find({
      $and: requiredFields.map(field => ({
        [field]: { $exists: true, $nin: [null, ""] }
      }))
    });

    if (!doctors.length) {
      return sendError(res, "No completed doctor profiles found", HttpStatusCode.NOT_FOUND);
    }

    // Ensure they are valid doctor users
    const doctorUserIds = doctors.map(d => d.userId);
    const users = await UserModel.find({
      _id: { $in: doctorUserIds },
      role: UserRole.DOCTOR
    });

    // Merge user + profile data
    const result = doctors.map(doc => {
      const user = users.find((u: any) => u._id.toString() === doc.userId.toString());
      return {
        ...user?.toObject(),
        ...doc.toObject()
      };
    });

    return sendSuccess(res, result, "Completed doctor profiles fetched successfully");
  } catch (error: any) {
    return sendError(res, error.message, HttpStatusCode.BAD_REQUEST);
  }
};

export default { updateProfile, getProfile, getCompletedDoctorProfiles };