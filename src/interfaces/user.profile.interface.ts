import { DoctorSpecialization } from './user.interface';

/**
 * Base Profile Interface
 */
export interface BaseProfile {
  userId: string;
  name: string;
  age: number;
  contactNumber: string;
  address: string;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Doctor Profile Interface
 */
export interface DoctorProfile extends BaseProfile {
  specialization: DoctorSpecialization;
  experience: number;
  licenseNumber?: string;
  consultationTiming: string;
  education?: string;
  certifications?: string[];
  languages?: string[];
}

/**
 * Patient Profile Interface
 */
export interface PatientProfile extends BaseProfile {
  bloodGroup: string;
  weight: number;
  height: number;
  ongoingTreatment?: string;
  healthIssues?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory?: string[];
}