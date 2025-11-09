export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  userType: UserType;
  municipalityId: string;
  verificationStatus: VerificationStatus;
  pointsBalance: number;
  profilePictureURL?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export type UserType = 
  | 'resident' 
  | 'municipal_staff' 
  | 'supervisor' 
  | 'admin';

export type VerificationStatus = 
  | 'pending' 
  | 'verified' 
  | 'rejected';