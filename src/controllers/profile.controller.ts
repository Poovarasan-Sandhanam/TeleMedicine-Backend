import e, {Request, Response} from "express"

import HttpStatusCode from "http-status-codes"
import {sendError, sendSuccess} from "../utilities/responseHandler";
import userService from "../services/user.service";
import userProfileModel from "../models/user/userProfileModel";
import { ObjectId } from "mongodb";


const updateProfile = async (req: Request, res: Response) => {
    try {
        const { name, age, bloodGroup, weight, height, ongoingTreatment, healthIssues, contactNumber, address, specialized, experience, consultationTiming, email } = req.body;
        const userId = ( req as any ).user._id
        const imageUrl = req.file
                            ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
                            : null;

        // Ensure all required fields are provided
        if (!name || !age || !bloodGroup || !weight || !height || !contactNumber || !address || !specialized || !experience || !healthIssues) {
            return sendError(res, 'All required fields must be provided', HttpStatusCode.BAD_REQUEST);
        }

        // Check if the patient exists
        const existingPatient = await userService.getUserDetails({_id: userId});  // This function checks by patientId
        if (!existingPatient) {
            return sendError(res, 'User not  found', HttpStatusCode.NOT_FOUND);
        }

        const updatedPatient = await userProfileModel.updateOne({ userId }, {
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
        }, { upsert: true });

        // Return success response with updated details
        return sendSuccess(res, updatedPatient, 'Profile updated successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = ( req as any ).user._id
        const pipeline =  [
            {
                $match: {
                    userId: new ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails',
                    pipeline: [
                        { $project: { _id: 0, __v: 0 } }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            }
        ];
        const userDetails = await userProfileModel.aggregate(pipeline)


        return sendSuccess(res, {userDetails}, 'Profile fetched successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}


export default {updateProfile,getProfile}
