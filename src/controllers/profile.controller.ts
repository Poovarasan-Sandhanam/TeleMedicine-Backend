import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError, sendSuccess } from "../utilities/responseHandler";
import userService from "../services/user.service";

import doctorProfileModel from "../models/user/doctorProfile.model";
import patientProfileModel from "../models/user/patientProfile.model";
import { uploadToS3 } from "../utilities/s3Uploader";
import { ObjectId } from "mongodb";
import { UserRole, DoctorSpecialization } from "../interfaces/user.interface";

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const userData = await userService.getUserDetails({ _id: userId });
    
    if (!userData) {
      return sendError(res, 'User not found', HttpStatusCode.NOT_FOUND);
    }

    const imageUrl = req.file ? await uploadToS3(req.file) : null;
    const isUserDoctor = userData.role === UserRole.DOCTOR || userData.isDoctor === true;

    if (isUserDoctor) {
      // Handle doctor profile update
      const {
        name,
        age,
        contactNumber,
        address,
        specialization,
        experience,
        consultationTiming,
        licenseNumber,
        education,
        certifications,
        languages
      } = req.body;

      // Validate required fields for doctors
      const requiredFields = { name, age, contactNumber, address, specialization, experience, consultationTiming };
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
          return sendError(res, `Field ${key} is required for doctors`, HttpStatusCode.BAD_REQUEST);
        }
      }

      // Validate specialization
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
          profileImage: imageUrl,
        },
        { upsert: true }
      );

      return sendSuccess(res, updatedProfile, 'Doctor profile updated successfully', HttpStatusCode.OK);

    } else {
      // Handle patient profile update
      const {
        name,
        age,
        bloodGroup,
        weight,
        height,
        ongoingTreatment,
        healthIssues,
        contactNumber,
        address,
        allergies,
        emergencyContact
      } = req.body;

      // Validate required fields for patients
      const requiredFields = { name, age, bloodGroup, weight, height, contactNumber, address };
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
          return sendError(res, `Field ${key} is required for patients`, HttpStatusCode.BAD_REQUEST);
        }
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
          emergencyContact,
          profileImage: imageUrl,
        },
        { upsert: true }
      );

      return sendSuccess(res, updatedProfile, 'Patient profile updated successfully', HttpStatusCode.OK);
    }

  } catch (error: any) {
    return res.status(HttpStatusCode.BAD_REQUEST).send({
      status: false,
      message: error.message,
    });
  }
};

const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const userData = await userService.getUserDetails({ _id: userId });
        
        if (!userData) {
            return sendError(res, 'User not found', HttpStatusCode.NOT_FOUND);
        }

        const isUserDoctor = userData.role === UserRole.DOCTOR || userData.isDoctor === true;
        let profileData;

        if (isUserDoctor) {
            // Get doctor profile
            const doctorProfile = await doctorProfileModel.findOne({ userId });
            if (doctorProfile) {
                profileData = { ...userData.toObject(), ...doctorProfile.toObject() };
            } else {
                profileData = userData;
            }
        } else {
            // Get patient profile
            const patientProfile = await patientProfileModel.findOne({ userId });
            if (patientProfile) {
                profileData = { ...userData.toObject(), ...patientProfile.toObject() };
            } else {
                profileData = userData;
            }
        }

        return sendSuccess(res, profileData, 'Profile fetched successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

const getDoctorTypes = async (req: Request, res: Response) => {
    try {
        const doctorTypes = Object.values(DoctorSpecialization);
        return sendSuccess(res, doctorTypes, 'Doctor Types fetched successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

export default { updateProfile, getProfile, getDoctorTypes };