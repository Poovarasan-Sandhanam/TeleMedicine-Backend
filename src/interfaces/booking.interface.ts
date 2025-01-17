import {ObjectId} from "mongodb";

export interface Booking {
    patientId: ObjectId;
    doctorId: ObjectId;
    checkupTiming: string;
    status?: string;
    paymentReferenceId?: string;
    paymentDate?: Date;
    paymentMethod?: string;
    amount?: number;
    error?: string;
    isBooked: boolean;
}



export interface IBooking extends Booking, Document {}
