import mongoose, { Schema } from "mongoose"
import { PatientProfile } from "../../interfaces/user.profile.interface"

/**
 * Patient Profile Schema
 * 
 * BEST PRACTICE APPROACH:
 * - Separate table for patient-specific data
 * - Linked to main user table via userId
 * - Contains only health/medical information
 * - Benefits:
 *   1. Clean separation of authentication vs. health data
 *   2. Better data organization
 *   3. Easier to query patient-specific information
 *   4. Scalable for future patient features
 *   5. Type-safe with specific interfaces
 *   6. Better privacy and security
 */
const patientProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            unique: true,
            index: true // For faster lookups
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            required: true,
            min: 0,
            max: 120
        },
        contactNumber: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        bloodGroup: {
            type: String,
            required: true,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            index: true // For emergency queries
        },
        weight: {
            type: Number,
            required: true,
            min: 1,
            max: 500 // kg
        },
        height: {
            type: Number,
            required: true,
            min: 50,
            max: 250 // cm
        },
        ongoingTreatment: {
            type: String,
            required: false,
            trim: true
        },
        healthIssues: [{
            type: String,
            required: false,
            trim: true
        }],
        allergies: [{
            type: String,
            required: false,
            trim: true
        }],
        emergencyContact: {
            name: {
                type: String,
                required: false,
                trim: true
            },
            relationship: {
                type: String,
                required: false,
                trim: true
            },
            phone: {
                type: String,
                required: false,
                trim: true
            }
        },
        medicalHistory: [{
            type: String,
            required: false,
            trim: true
        }],
        profileImage: {
            type: String,
            required: false,
            trim: true
        },
        // Additional health fields
        bmi: {
            type: Number,
            required: false,
            min: 10,
            max: 100
        },
        smokingStatus: {
            type: String,
            enum: ['Never', 'Former', 'Current'],
            default: 'Never'
        },
        alcoholConsumption: {
            type: String,
            enum: ['None', 'Occasional', 'Moderate', 'Heavy'],
            default: 'None'
        },
        exerciseFrequency: {
            type: String,
            enum: ['Never', 'Rarely', 'Sometimes', 'Regularly', 'Daily'],
            default: 'Never'
        },
        chronicConditions: [{
            type: String,
            required: false,
            trim: true
        }],
        medications: [{
            name: {
                type: String,
                required: false,
                trim: true
            },
            dosage: {
                type: String,
                required: false,
                trim: true
            },
            frequency: {
                type: String,
                required: false,
                trim: true
            }
        }],
        insuranceInfo: {
            provider: {
                type: String,
                required: false,
                trim: true
            },
            policyNumber: {
                type: String,
                required: false,
                trim: true
            },
            groupNumber: {
                type: String,
                required: false,
                trim: true
            }
        },
        preferredLanguage: {
            type: String,
            required: false,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { 
        timestamps: true,
        // Optimize for queries
        collection: 'patientprofiles'
    }
)

// Indexes for better performance
patientProfileSchema.index({ bloodGroup: 1 });
patientProfileSchema.index({ age: 1 });
patientProfileSchema.index({ isActive: 1 });
patientProfileSchema.index({ 'emergencyContact.phone': 1 });

// Calculate BMI on save
patientProfileSchema.pre('save', function(next) {
    if (this.weight && this.height) {
        const heightInMeters = this.height / 100;
        this.bmi = Math.round((this.weight / (heightInMeters * heightInMeters)) * 100) / 100;
    }
    next();
});

patientProfileSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id
        delete ret.__v
    }
})

export default mongoose.model<PatientProfile>("PatientProfile", patientProfileSchema) 