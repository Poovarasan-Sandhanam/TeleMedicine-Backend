import mongoose from 'mongoose';
import userModel from '../models/user/user.model';
import { UserRole } from '../interfaces/user.interface';
import config from '../configurations/config';

/**
 * Migration script to update existing users to new role system
 */
export const migrateUsersToNewRoleSystem = async () => {
    try {
        console.log('Starting user migration to new role system...');

        // Connect to database
        await mongoose.connect(config.MONGO.url);
        console.log('Connected to database');

        // Find all users without role field
        const usersWithoutRole = await userModel.find({
            $or: [
                { role: { $exists: false } },
                { role: null }
            ]
        });

        console.log(`Found ${usersWithoutRole.length} users to migrate`);

        for (const user of usersWithoutRole) {
            // Determine role based on isDoctor field
            const newRole = user.isDoctor ? UserRole.DOCTOR : UserRole.PATIENT;
            
            // Update user with new role system
            await userModel.updateOne(
                { _id: user._id },
                {
                    $set: {
                        role: newRole,
                        specialization: user.doctorType || null,
                        // Keep legacy fields for backward compatibility
                        isDoctor: user.isDoctor,
                        doctorType: user.doctorType
                    }
                }
            );

            console.log(`Migrated user ${user.email} to role: ${newRole}`);
        }

        console.log('User migration completed successfully');
        
        // Disconnect from database
        await mongoose.disconnect();
        console.log('Disconnected from database');

    } catch (error) {
        console.error('Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

/**
 * Migration script to create separate profile collections
 * Note: This migration assumes existing UserProfile collection exists
 */
export const migrateProfilesToSeparateCollections = async () => {
    try {
        console.log('Starting profile migration to separate collections...');

        // Connect to database
        await mongoose.connect(config.MONGO.url);
        console.log('Connected to database');

        // Check if UserProfile collection exists
        const db = mongoose.connection.db;
        if (!db) {
            console.log('Database connection not available. Skipping profile migration.');
            return;
        }

        const collections = await db.listCollections().toArray();
        const userProfileExists = collections.some(col => col.name === 'userprofiles');

        if (!userProfileExists) {
            console.log('No UserProfile collection found. Skipping profile migration.');
            return;
        }

        // Import models
        const doctorProfileModel = mongoose.model('DoctorProfile');
        const patientProfileModel = mongoose.model('PatientProfile');

        // Get all user profiles from existing collection
        const allProfiles = await db.collection('userprofiles').find({}).toArray();

        console.log(`Found ${allProfiles.length} profiles to migrate`);

        for (const profile of allProfiles) {
            // Get user to determine role
            const user = await userModel.findById(profile.userId);
            
            if (!user) {
                console.log(`User not found for profile ${profile._id}, skipping...`);
                continue;
            }

            const isDoctor = user.role === UserRole.DOCTOR || user.isDoctor === true;

            if (isDoctor) {
                // Create doctor profile
                await doctorProfileModel.create({
                    userId: profile.userId,
                    name: profile.name,
                    age: profile.age,
                    contactNumber: profile.contactNumber,
                    address: profile.address,
                    specialization: profile.specialized,
                    experience: profile.experience,
                    consultationTiming: profile.consultationTiming,
                    profileImage: profile.profileImage
                });
                console.log(`Created doctor profile for user ${user.email}`);
            } else {
                // Create patient profile
                await patientProfileModel.create({
                    userId: profile.userId,
                    name: profile.name,
                    age: profile.age,
                    contactNumber: profile.contactNumber,
                    address: profile.address,
                    bloodGroup: profile.bloodGroup,
                    weight: profile.weight,
                    height: profile.height,
                    ongoingTreatment: profile.ongoingTreatment,
                    healthIssues: profile.healthIssues ? [profile.healthIssues] : [],
                    profileImage: profile.profileImage
                });
                console.log(`Created patient profile for user ${user.email}`);
            }
        }

        console.log('Profile migration completed successfully');
        
        // Disconnect from database
        await mongoose.disconnect();
        console.log('Disconnected from database');

    } catch (error) {
        console.error('Profile migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

// Run migrations if this file is executed directly
if (require.main === module) {
    const runMigrations = async () => {
        await migrateUsersToNewRoleSystem();
        await migrateProfilesToSeparateCollections();
        console.log('All migrations completed successfully');
        process.exit(0);
    };

    runMigrations().catch(console.error);
} 