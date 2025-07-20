import mongoose, { Document, Schema } from 'mongoose';

export interface AISymptomCheck extends Document {
  symptoms: string;
  possible_conditions: string[];
  recommended_doctor: string;
  createdAt: Date;
}

const AISymptomCheckSchema = new Schema<AISymptomCheck>({
  symptoms: { type: String, required: true },
  possible_conditions: { type: [String], required: true },
  recommended_doctor: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<AISymptomCheck>('AISymptomCheck', AISymptomCheckSchema); 