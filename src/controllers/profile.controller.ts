import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError, sendSuccess } from "../utilities/responseHandler";
import userService from "../services/user.service";
import userProfileModel from "../models/user/userProfileModel";
import { uploadFileToS3 } from "../services/s3Service";
import { ObjectId } from "mongodb";

const updateProfile = async (req: Request, res: Response) => {
  try {
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
      specialized,
      experience,
      consultationTiming,
    } = req.body;

    const userId = (req as any).user._id;

    console.log("➡️ Uploaded file:", req.file);

    const userData = await userService.getUserDetails({ _id: userId });
    if (!userData) {
      console.log("❌ User not found");
      return sendError(res, "User not found", HttpStatusCode.NOT_FOUND);
    }

    const isDoctor = userData.isDoctor;
    console.log("🧑‍⚕️ Is Doctor:", isDoctor);

    if (isDoctor && !req.file) {
      console.log("⚠️ Doctor profile update missing image");
      return sendError(
        res,
        "Profile image is required for doctors",
        HttpStatusCode.BAD_REQUEST
      );
    }

    const requiredFields = isDoctor
      ? { name, age, contactNumber, address, specialized, experience, consultationTiming }
      : { name, age, bloodGroup, weight, height, contactNumber, address, ongoingTreatment, healthIssues };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.log(`⚠️ Missing required field: ${key}`);
        return sendError(res, `Field ${key} is required`, HttpStatusCode.BAD_REQUEST);
      }
    }

    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadFileToS3(req.file);
        console.log("🖼️ Image uploaded to S3:", imageUrl);
      } catch (err) {
        console.error("❌ Error uploading to S3:", err);
        return sendError(res, "Failed to upload image", HttpStatusCode.INTERNAL_SERVER_ERROR);
      }
    }

    const updateData: any = {
      name,
      age,
      contactNumber,
      address,
    };

    if (isDoctor) {
      Object.assign(updateData, {
        specialized,
        experience,
        consultationTiming,
      });
    } else {
      Object.assign(updateData, {
        bloodGroup,
        weight,
        height,
        ongoingTreatment,
        healthIssues,
      });
    }

    if (imageUrl) {
      updateData.profileImage = imageUrl;
    }

    console.log("📝 Update Data:", updateData);

    const updatedProfile = await userProfileModel.updateOne(
      { userId: new ObjectId(userId) },
      { $set: updateData },
      { upsert: true }
    );

    console.log("✅ Profile updated:", updatedProfile);
    return sendSuccess(
      res,
      updatedProfile,
      "Profile updated successfully",
      HttpStatusCode.OK
    );
  } catch (error: any) {
    console.error("❌ Error in updateProfile:", error.message);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
      status: false,
      message: error.message,
    });
  }
};


const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const pipeline = [
            {
                $match: { userId: new ObjectId(userId) },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails',
                    pipeline: [
                        { $project: { id: 0, _v: 0 } },
                    ],
                },
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        const isUserExist = await userProfileModel.findOne({ userId });
        let userDetails;
        let updatedUserData;

        if (!isUserExist) {
            userDetails = await userService.getUserDetails({ _id: userId });
            updatedUserData = userDetails;
        } else {
            userDetails = (await userProfileModel.aggregate(pipeline))[0];
            updatedUserData = { ...userDetails, ...userDetails.userDetails };
            delete updatedUserData.userDetails;
        }

        return sendSuccess(res, updatedUserData, 'Profile fetched successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

const getDoctorTypes = async (req: Request, res: Response) => {
    try {
        const doctorTypes = [
            "General Practitioner (GP)",
            "Cardiologist",
            "Pediatrician",
            "Orthopedic Surgeon",
            "Gynecologist",
            "Obstetrician (OB)",
            "Dermatologist",
            "Endocrinologist",
            "Neurologist",
            "Psychiatrist",
            "Gastroenterologist",
            "Pulmonologist",
            "Oncologist",
            "Ophthalmologist",
            "Urologist",
        ];
        return sendSuccess(res, doctorTypes, 'Doctor Types fetched successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

export default { updateProfile, getProfile, getDoctorTypes };
