import mongoose, { Schema, Document } from "mongoose";
import { DoctorSpecialization } from "../../interfaces/user.interface";

export interface IDoctorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  contactNumber: string;
  address: string;
  specialization: DoctorSpecialization;
  experience: number;
  consultationTiming: string;
  licenseNumber?: string;
  education?: string;
  certifications?: string[];
  languages?: string[];
  profileImage?: string;
}

const doctorProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 0, max: 100 },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  specialization: { type: String, enum: Object.values(DoctorSpecialization), required: true },
  experience: { type: Number, required: true },
  consultationTiming: { type: String, required: true },
  licenseNumber: { type: String },
  education: { type: String },
  certifications: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  profileImage: { type: String },
}, { timestamps: true });

export default mongoose.model<IDoctorProfile>("DoctorProfile", doctorProfileSchema);
