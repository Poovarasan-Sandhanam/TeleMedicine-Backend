// models/doctorType.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorType extends Document {
  id: string;
  title: string;
  image: string; // S3 URL
}

const DoctorTypeSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
});

export default mongoose.model<IDoctorType>('DoctorType', DoctorTypeSchema);
