import mongoose, { Schema } from 'mongoose';

/**
 * Audit trail for "find me a doctor" requests: what the patient wrote, how it was
 * understood (and by the model or the keyword rules), whether it was treated as an
 * emergency, and how many options were offered. Lets suggestions be reviewed later.
 */
const careRequestSchema = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    intent: { type: Schema.Types.Mixed },
    emergency: { type: Boolean, default: false },
    source: { type: String, enum: ['ai', 'rules'] },
    suggestionCount: { type: Number, default: 0 },
    widened: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('CareRequest', careRequestSchema);
