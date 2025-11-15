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
            type: String,
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
        date : {
            type: Date,
            required: true
        }
    }, {timestamps: true});

appointments.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
  },
});

export default mongoose.model<IAppointments>("Appointments", appointments)