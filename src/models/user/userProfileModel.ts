import mongoose, {Schema} from "mongoose"

import {IProfile} from "../../interfaces/user.profile.interface";

/**
 * UserSchema for the database
 */
const userProfile = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
        },
        name :{
            type: String,
            required: false,
        },
        age: {
            type: Number,
            required: true,
        },
        bloodGroup: {
            type: String,
            required: true,
        },
        weight: {
            type: String,
            required: true,
        },
        height: {
            type: String,
            required: true,
        },
        ongoingTreatment: {
            type: String,
            required: false,
        },
        healthIssues: {
            type: String,
            required: false,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        specialized: {
            type: String,
            required: true,
        },
        experience: {
            type: Number,
            required: true,
        },
        consultationTiming : {
            type: String,
            required: false
        },
        profileImage : {
            type: String,
            required: false
        }
    }, { timestamps: true });

userProfile.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id
        delete ret.__v
    }
})
export default mongoose.model<IProfile>("UserProfile", userProfile)