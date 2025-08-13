// src/interfaces/patientProfile.interface.ts
export interface IPatientProfile {
  userId: string;
  name: string;
  age: number;
  bloodGroup: string;
  weight: number;
  height: number;
  ongoingTreatment?: string;
  healthIssues?: string[];
  contactNumber: string;
  address: string;
  allergies?: string[];
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
