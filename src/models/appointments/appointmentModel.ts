import mongoose, {Schema} from "mongoose"

import {IAppointments, AppointmentStatus} from "../../interfaces/appointments.interface";

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
            ref: 'User',
        },
        bookedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        notes: {
            // Optional: the booking form allows an empty note, and Mongoose treats
            // `required: true` on a String as rejecting the empty string.
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: Object.values(AppointmentStatus),
            default: AppointmentStatus.HELD
        },
        date : {
            type: Date,
            required: true
        },
        /**
         * When a `held` slot stops blocking the calendar. Expiry is enforced at query
         * time rather than by deleting the document, so an abandoned checkout leaves an
         * auditable record instead of vanishing.
         */
        expiresAt: {
            type: Date,
            required: false
        },
        cancelledBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        cancelledAt: {
            type: Date,
            required: false
        }
    }, {timestamps: true});

/** Backs the slot-availability lookup in getAllDoctors and the conflict check on booking. */
appointments.index({doctor: 1, date: 1, checkupTiming: 1, status: 1});

appointments.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete (ret as any)._id;
    delete (ret as any).__v;
  },
});

export default mongoose.model<IAppointments>("Appointments", appointments)
