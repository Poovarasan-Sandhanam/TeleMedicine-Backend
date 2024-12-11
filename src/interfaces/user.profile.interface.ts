export interface IProfile {
    age: number;
    bloodGroup: string;
    weight: number;
    height: number;
    ongoingTreatment?: string;  // Optional field
    healthIssues?: string;  // Optional field
    contactNumber: string;
    address: string;
    specialized: string;
    experience: number;
    consultationTiming?: string;  // Optional field
    profileImage?:string;
}