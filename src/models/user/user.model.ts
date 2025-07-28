import mongoose from "mongoose"
import { UserRole, UserDocument, BaseUser } from "../../interfaces/user.interface"

/**
 * UserSchema for the database
 * 
 * BEST PRACTICE APPROACH:
 * - Single user table for authentication and basic info
 * - Role-based access control
 * - Separate profile tables for role-specific data
 * - This approach provides:
 *   1. Unified authentication system
 *   2. Single source of truth for user data
 *   3. Clean separation of concerns
 *   4. Easy scalability for new roles
 *   5. Better performance and maintainability
 */
const userSchema = new mongoose.Schema(
    {
        fullName: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
            default: UserRole.PATIENT
        },
        // Legacy fields for backward compatibility
        isDoctor: {type: Boolean, required: false},
        doctorType: {type: String, required: false}
    },
    {
        timestamps: true,
        minimize: false,
    }
)

// Pre-save middleware to maintain backward compatibility
userSchema.pre('save', function(next) {
    if (this.isModified('role')) {
        // Update legacy fields for backward compatibility
        this.isDoctor = this.role === UserRole.DOCTOR;
        this.doctorType = null;
    }
    next();
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isDoctor: 1 });

userSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id
        delete ret.__v
    }
})

export default mongoose.model<UserDocument>("User", userSchema)
