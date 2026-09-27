import doctorProfileModel from '../models/user/doctorProfile.model';
import UserModel from '../models/user/user.model';
import { UserRole } from '../interfaces/user.interface';

/** Profile fields a doctor must fill in before patients can find and book them. */
export const COMPLETE_PROFILE_FIELDS = [
    'name', 'age', 'contactNumber', 'address', 'specialization',
    'experience', 'consultationTiming', 'gender', 'licenseNumber',
];

/**
 * Doctors patients can book: a complete profile belonging to an account that is
 * still a doctor. Each entry merges the user (fullName, email) with the profile.
 *
 * The listing this replaces said it ensured valid doctor users but kept every
 * profile regardless, so a profile whose account was deleted or no longer a
 * doctor still appeared as bookable.
 */
export const listBookableDoctors = async (filter: { specialization?: string } = {}) => {
    const profiles = await doctorProfileModel
        .find({
            $and: COMPLETE_PROFILE_FIELDS.map(field => ({ [field]: { $exists: true, $nin: [null, ''] } })),
            ...(filter.specialization ? { specialization: filter.specialization } : {}),
        })
        .lean();
    if (!profiles.length) {
        return [];
    }
    const users = await UserModel
        .find({ _id: { $in: profiles.map(p => p.userId) }, role: UserRole.DOCTOR })
        .select('-password -__v')
        .lean();
    const byId = new Map(users.map(u => [String(u._id), u]));
    return profiles
        .filter(p => byId.has(String(p.userId)))
        .map(p => ({ ...byId.get(String(p.userId)), ...p }));
};
