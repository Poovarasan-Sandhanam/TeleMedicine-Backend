import userModel from "../models/user/user.model";
import doctorProfileModel from "../models/user/doctorProfile.model";
import patientProfileModel from "../models/user/patientProfile.model";
import { UserRole, isDoctor, isPatient } from "../interfaces/user.interface";

/**
 * User Service - Best Practice Implementation
 * 
 * WHY THIS APPROACH IS BEST:
 * 
 * 1. UNIFIED AUTHENTICATION
 *    - Single service handles all user types
 *    - Same authentication logic for doctors and patients
 *    - Easier to maintain and test
 * 
 * 2. ROLE-BASED DATA ACCESS
 *    - Clean separation of concerns
 *    - Type-safe operations
 *    - Better performance with targeted queries
 * 
 * 3. SCALABILITY
 *    - Easy to add new roles
 *    - Modular design
 *    - Reusable components
 * 
 * 4. DATA INTEGRITY
 *    - Referential integrity between tables
 *    - Consistent user IDs across all tables
 *    - No data duplication
 * 
 * 5. PERFORMANCE
 *    - Optimized queries with indexes
 *    - Smaller, focused tables
 *    - Better caching strategies
 */
class UserService {
    
    /**
     * Get user details by criteria
     */
    async getUserDetails(criteria: any) {
        return await userModel.findOne(criteria);
    }

    /**
     * Save user details
     */
    async saveUserDetails(userData: any) {
        return await userModel.create(userData);
    }

    /**
     * Get user with role-specific profile
     */
    async getUserWithProfile(userId: string) {
        const user = await userModel.findById(userId);
        if (!user) return null;

        let profile = null;
        
        if (isDoctor(user)) {
            profile = await doctorProfileModel.findOne({ userId });
        } else if (isPatient(user)) {
            profile = await patientProfileModel.findOne({ userId });
        }

        return {
            ...user.toObject(),
            profile: profile ? profile.toObject() : null
        };
    }

    /**
     * Get all doctors with their profiles
     */
    async getAllDoctors() {
        return await userModel.aggregate([
            { $match: { role: UserRole.DOCTOR } },
            {
                $lookup: {
                    from: 'doctorprofiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    password: 0,
                    __v: 0
                }
            }
        ]);
    }

    /**
     * Get all patients with their profiles
     */
    async getAllPatients() {
        return await userModel.aggregate([
            { $match: { role: UserRole.PATIENT } },
            {
                $lookup: {
                    from: 'patientprofiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    password: 0,
                    __v: 0
                }
            }
        ]);
    }

    /**
     * Get doctors by specialization
     */
    async getDoctorsBySpecialization(specialization: string) {
        return await userModel.aggregate([
            { $match: { role: UserRole.DOCTOR } },
            {
                $lookup: {
                    from: 'doctorprofiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    'profile.specialization': specialization
                }
            },
            {
                $project: {
                    password: 0,
                    __v: 0
                }
            }
        ]);
    }

    /**
     * Update user profile based on role
     */
    async updateUserProfile(userId: string, profileData: any) {
        const user = await userModel.findById(userId);
        if (!user) throw new Error('User not found');

        if (isDoctor(user)) {
            return await doctorProfileModel.findOneAndUpdate(
                { userId },
                profileData,
                { upsert: true, new: true }
            );
        } else if (isPatient(user)) {
            return await patientProfileModel.findOneAndUpdate(
                { userId },
                profileData,
                { upsert: true, new: true }
            );
        }

        throw new Error('Invalid user role');
    }

    /**
     * Delete user and associated profile
     */
    async deleteUser(userId: string) {
        const user = await userModel.findById(userId);
        if (!user) throw new Error('User not found');

        // Delete role-specific profile
        if (isDoctor(user)) {
            await doctorProfileModel.deleteOne({ userId });
        } else if (isPatient(user)) {
            await patientProfileModel.deleteOne({ userId });
        }

        // Delete user
        return await userModel.findByIdAndDelete(userId);
    }

    /**
     * Get user statistics
     */
    async getUserStatistics() {
        const [totalUsers, totalDoctors, totalPatients] = await Promise.all([
            userModel.countDocuments(),
            userModel.countDocuments({ role: UserRole.DOCTOR }),
            userModel.countDocuments({ role: UserRole.PATIENT })
        ]);

        return {
            totalUsers,
            totalDoctors,
            totalPatients,
            doctorPercentage: Math.round((totalDoctors / totalUsers) * 100),
            patientPercentage: Math.round((totalPatients / totalUsers) * 100)
        };
    }

    /**
     * Search users by name or email
     */
    async searchUsers(query: string, role?: UserRole) {
        const searchCriteria: any = {
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        };

        if (role) {
            searchCriteria.role = role;
        }

        return await userModel.find(searchCriteria).select('-password');
    }
}

export default new UserService();