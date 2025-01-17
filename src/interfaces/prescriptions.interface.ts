import {ObjectId} from "mongodb";

export interface Prescriptions {
    patientId: ObjectId;
    doctorId: ObjectId;
    patientName: string;
    age?: number;
    symptoms?: string;
    diagnosis?: Date;
    medications?: string;
    notes?: number;
    date?: string;
}



export interface IPrescriptions extends Prescriptions, Document {}
