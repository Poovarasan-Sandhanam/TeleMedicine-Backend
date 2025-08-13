// src/interfaces/doctorProfile.interface.ts
export interface IDoctorProfile {
  userId: string;
  name: string;
  age: number;
  contactNumber: string;
  address: string;
  specialization: string; // consider using enum for DoctorSpecialization
  experience: number;
  consultationTiming: string;
  licenseNumber?: string;
  education?: string;
  certifications?: string[];
  languages?: string[];
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
