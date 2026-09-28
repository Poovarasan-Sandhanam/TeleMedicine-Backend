import {ObjectId} from "mongodb";

export interface Medication {
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
}

export interface Prescriptions {
    /** The consultation this prescription came out of. */
    appointmentId?: ObjectId;
    patientId: ObjectId;
    doctorId: ObjectId;
    patientName: string;
    age?: number;
    symptoms?: string[];
    diagnosis?: string;
    medications?: Medication[];
    notes?: string;
    date?: Date;
}

export interface IPrescriptions extends Prescriptions, Document {}
