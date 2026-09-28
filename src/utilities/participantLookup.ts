/**
 * Aggregation stages that attach the other party of an appointment as `userDetails`.
 *
 * Joins the `users` record for the name and email, and the role profile for contact
 * number, gender and photo - the fields the mobile screens show, which live on the
 * profile rather than the user. Credentials are projected away here, in one place;
 * previously each pipeline did its own raw $lookup and sent the bcrypt hash to the
 * client.
 *
 * @param localField        appointment field holding the other party's user id
 * @param profileCollection `doctorprofiles` or `patientprofiles`
 */
export const withParticipant = (localField: string, profileCollection: string) => [
    {$lookup: {from: 'users', localField, foreignField: '_id', as: 'userDetails'}},
    {$unwind: {path: '$userDetails', preserveNullAndEmptyArrays: true}},
    {$lookup: {from: profileCollection, localField, foreignField: 'userId', as: 'participantProfile'}},
    {$unwind: {path: '$participantProfile', preserveNullAndEmptyArrays: true}},
    {
        $addFields: {
            'userDetails.contactNo': '$participantProfile.contactNumber',
            'userDetails.gender': '$participantProfile.gender',
            'userDetails.profileImage': '$participantProfile.profileImage',
            'userDetails.specialization': '$participantProfile.specialization',
        }
    },
    {$project: {'userDetails.password': 0, 'userDetails.__v': 0, participantProfile: 0}},
];
