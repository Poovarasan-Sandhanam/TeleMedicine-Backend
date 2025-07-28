import mongoose, { Schema } from "mongoose"
import { DoctorProfile } from "../../interfaces/user.profile.interface"
import { DoctorSpecialization } from "../../interfaces/user.interface"

/**
 * Doctor Profile Schema
 * 
 * BEST PRACTICE APPROACH:
 * - Separate table for doctor-specific data
 * - Linked to main user table via userId
 * - Contains only medical/professional information
 * - Benefits:
 *   1. Clean separation of authentication vs. professional data
 *   2. Better data organization
 *   3. Easier to query doctor-specific information
 *   4. Scalable for future doctor features
 *   5. Type-safe with specific interfaces
 */
const doctorProfileSchema = new mongoose.Schema(
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
            min: 18,
            max: 100
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
        specialization: {
            type: String,
            enum: Object.values(DoctorSpecialization),
            required: true,
            index: true // For filtering by specialization
        },
        experience: {
            type: Number,
            required: true,
            min: 0,
            max: 50
        },
        licenseNumber: {
            type: String,
            required: false,
            trim: true,
            unique: true,
            sparse: true // Allow null values
        },
        consultationTiming: {
            type: String,
            required: true,
            trim: true
        },
        education: {
            type: String,
            required: false,
            trim: true
        },
        certifications: [{
            type: String,
            required: false,
            trim: true
        }],
        languages: [{
            type: String,
            required: false,
            trim: true
        }],
        profileImage: {
            type: String,
            required: false,
            trim: true
        },
        // Additional professional fields
        yearsOfExperience: {
            type: Number,
            required: false,
            min: 0
        },
        hospitalAffiliations: [{
            type: String,
            required: false,
            trim: true
        }],
        awards: [{
            type: String,
            required: false,
            trim: true
        }],
        researchPublications: [{
            type: String,
            required: false,
            trim: true
        }],
        consultationFee: {
            type: Number,
            required: false,
            min: 0
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    { 
        timestamps: true,
        // Optimize for queries
        collection: 'doctorprofiles'
    }
)

// Indexes for better performance
doctorProfileSchema.index({ specialization: 1 });
doctorProfileSchema.index({ experience: -1 });
doctorProfileSchema.index({ isAvailable: 1 });
doctorProfileSchema.index({ consultationFee: 1 });

doctorProfileSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id
        delete ret.__v
    }
})

export default mongoose.model<DoctorProfile>("DoctorProfile", doctorProfileSchema) 