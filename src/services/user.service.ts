import mongoose from "mongoose"
import userModel from "../models/user/user.model"


const getUserDetails = async (query: any) => {
    try {
        let result = await userModel.findOne(query)
        return result
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const updateUserDetailsById = async (userId: mongoose.Types.ObjectId, payload: any) => {
    try {
        let result = await userModel.findOneAndUpdate({_id: userId}, payload, {new: true})
        return result
    } catch (error: any) {
        throw new Error(error.message)
    }
}

const saveUserDetails = async (payload: any) => {
    try {
        await userModel.create(payload);
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export default {getUserDetails, updateUserDetailsById, saveUserDetails}