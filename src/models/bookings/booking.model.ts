import { Schema, model } from 'mongoose'
import {IBooking} from "../../interfaces/booking.interface";

const userBookingSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    appointmentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Appointments',
    },
    checkupTiming: {
        type: String,
    },
    status: {
        type: String,
    },
    paymentReferenceId: {
        type: String
    },
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String
    },
    amount: {
        type: Number
    },
    error: {
        type: String
    },
    isBooked : {
        type: Boolean,
        default: false
    },
    isFree : {
        type: Boolean,
        default: false
    }
});

userBookingSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id
        delete ret.__v
    }
})

const userBookingModel = model<IBooking>('UserBooking', userBookingSchema);

export default userBookingModel;
