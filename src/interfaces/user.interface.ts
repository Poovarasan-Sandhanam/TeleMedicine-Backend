/**
 * User Role Enum
 */
export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN'
}

/**
 * Doctor Specialization Enum
 */
export enum DoctorSpecialization {
  GENERAL_PRACTITIONER = 'General Practitioner (GP)',
  CARDIOLOGIST = 'Cardiologist',
  PEDIATRICIAN = 'Pediatrician',
  ORTHOPEDIC_SURGEON = 'Orthopedic Surgeon',
  GYNECOLOGIST = 'Gynecologist',
  OBSTETRICIAN = 'Obstetrician (OB)',
  DERMATOLOGIST = 'Dermatologist',
  ENDOCRINOLOGIST = 'Endocrinologist',
  NEUROLOGIST = 'Neurologist',
  PSYCHIATRIST = 'Psychiatrist',
  GASTROENTEROLOGIST = 'Gastroenterologist',
  PULMONOLOGIST = 'Pulmonologist',
  ONCOLOGIST = 'Oncologist',
  OPHTHALMOLOGIST = 'Ophthalmologist',
  UROLOGIST = 'Urologist'
}

/**
 * Base User Interface
 */
export interface BaseUser {
  _id?: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Doctor Interface
 */
export interface Doctor extends BaseUser {
  role: UserRole.DOCTOR;
}

/**
 * Patient Interface
 */
export interface Patient extends BaseUser {
  role: UserRole.PATIENT;
}

/**
 * User Document Interface (for backward compatibility)
 */
export interface UserDocument extends BaseUser {
  isDoctor?: boolean; // Legacy field for backward compatibility
  doctorType?: string; // Legacy field for backward compatibility
}

/**
 * Type guard to check if user is a doctor
 */
export const isDoctor = (user: BaseUser): user is Doctor => {
  return user.role === UserRole.DOCTOR;
}

/**
 * Type guard to check if user is a patient
 */
export const isPatient = (user: BaseUser): user is Patient => {
  return user.role === UserRole.PATIENT;
}
