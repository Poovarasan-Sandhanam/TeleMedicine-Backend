import mongoose, {Schema} from "mongoose"

import {IAppointments} from "../../interfaces/appointments.interface";

/**
 * Appointement Schema for the database
 */
const appointments = new mongoose.Schema(
    {
        healthIssue: {
            type: String,
            required: false,
        },
        checkupTiming: {
            type: Date,
            required: true,
        },
        doctor: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
        },
        bookedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
        },
        notes: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
            default: 'Pending'
        },
    }, {timestamps: true});

appointments.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id
        delete ret.__v
    }
})
export default mongoose.model<IAppointments>("Appointments", appointments)