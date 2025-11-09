export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  userType: UserType;
  municipalityId?: string | null;
  fullName?: string;
  phoneNumber?: string;
  createdAt?: any;
  lastLoginAt?: any | null;
}

export type UserType = 'ADMIN' | 'EMPLOYEE' | 'RESIDENT';




export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>; // Change this to Promise<void>
  logout: () => Promise<void>;
  loading: boolean;
}