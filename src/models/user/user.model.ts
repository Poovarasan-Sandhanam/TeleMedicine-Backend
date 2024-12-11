import mongoose from "mongoose"

import {UserDocument} from "../../interfaces/user.interface"

/**
 * UserSchema for the database
 */
const userSchema = new mongoose.Schema(
    {
        fullName: {type: String, required: true},
        dob: {type: Date, required: false},
        contactNo: {type: Number, required: false},
        email: {type: String, required: true},
        password: {type: String, required: true},
        isDoctor: {type: Boolean, required: true},
        doctorType: {type: String, required: false},
        gender: {type: String, required: false}
    },
    {
        timestamps: true,
        minimize: false,
    }
)

userSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id
        delete ret.__v
    }
})
export default mongoose.model<UserDocument>("User", userSchema)
