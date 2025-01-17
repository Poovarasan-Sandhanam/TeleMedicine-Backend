import { Schema, model } from 'mongoose'
import {IPrescriptions} from "../../interfaces/prescriptions.interface";

const prescriptionSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    patientName: {
        type: String
    },
    age: {
        type: Number
    },
    symptoms: {
        type: Array,
    },
    diagnosis: {
        type: String,
    },
    medications: {
        type: Array,
    },
    notes: {
        type: String
    },
    date: {
        type: Date
    },
});

prescriptionSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id
        delete ret.__v
    }
})

const prescriptionModel = model<IPrescriptions>('Prescriptions', prescriptionSchema);

export default prescriptionModel;
