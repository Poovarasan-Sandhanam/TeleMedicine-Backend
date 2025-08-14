import mongoose, { Schema, Document } from "mongoose";

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  bloodGroup: string;
  gender: string;
  weight: string;
  height: number;
  ongoingTreatment?: string;
  healthIssues?: string[];
  contactNumber: string;
  address: string;
  allergies?: string[];
  profileImage?: string;
}

const patientProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender:{ type: String, required: true },
  bloodGroup: { type: String, required: true },
  weight: { type: String, required: true },
  height: { type: Number, required: true },
  ongoingTreatment: { type: String },
  healthIssues: { type: [String], default: [] },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  allergies: { type: [String], default: [] },
  profileImage: { type: String },
}, { timestamps: true });

export default mongoose.model<IPatientProfile>("PatientProfile", patientProfileSchema);
