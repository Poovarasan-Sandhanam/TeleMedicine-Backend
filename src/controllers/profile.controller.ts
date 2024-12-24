import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { sendError, sendSuccess } from "../utilities/responseHandler";
import userService from "../services/user.service";
import userProfileModel from "../models/user/userProfileModel";
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
            consultationTiming
        } = req.body;

        const userId = (req as any).user._id;
        const imageUrl = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
            : null;

        const userData = await userService.getUserDetails({ _id: userId });
        const isDoctor = userData?.isDoctor;

        // Define required fields based on user type
        const requiredFields = isDoctor
            ? { name, age, contactNumber, address, specialized, experience, consultationTiming }
            : { name, age, bloodGroup, weight, height, contactNumber, address, ongoingTreatment, healthIssues };

        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return sendError(res, `Field ${key} is required`, HttpStatusCode.BAD_REQUEST);
            }
        }

        const existingPatient = await userService.getUserDetails({ _id: userId });
        if (!existingPatient) {
            return sendError(res, 'User not found', HttpStatusCode.NOT_FOUND);
        }

        const updatedProfile = await userProfileModel.updateOne(
            { userId },
            {
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
                profileImage: imageUrl
            },
            { upsert: true }
        );

        return sendSuccess(res, updatedProfile, 'Profile updated successfully', HttpStatusCode.OK);

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
                        { $project: { _id: 0, __v: 0 } },
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


