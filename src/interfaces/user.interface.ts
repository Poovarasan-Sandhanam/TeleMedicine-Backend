/**
 * UserDocument interface
 */
export interface UserDocument {
  _id?: string;
  email: string;
  password: string;
  isDoctor: boolean;
  doctorType: string;
}
