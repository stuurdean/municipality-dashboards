export interface User {
  id: string;
  email: string;
  fullName: string;
  userType: UserType;
  municipalityId: string;
  phoneNumber?: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  profilePictureUrl?: string;
  skills?: string[];
  currentWorkload: number;
  maxWorkload: number;
  assignedReports?: string[];
}

export type UserType = 'ADMIN' | 'EMPLOYEE' | 'RESIDENT';

export interface CreateUserDTO {
  email: string;
  fullName: string;
  userType: UserType;
  municipalityId: string;
  phoneNumber?: string;
  department?: string;
  skills?: string[];
  maxWorkload?: number;
}

export interface UpdateUserDTO {
  fullName?: string;
  userType?: UserType;
  phoneNumber?: string;
  department?: string;
  isActive?: boolean;
  skills?: string[];
  maxWorkload?: number;
  profilePictureUrl?: string;
}

export interface UserStats {
  total: number;
  byType: {
    ADMIN: number;
    EMPLOYEE: number;
    RESIDENT: number;
  };
  active: number;
  inactive: number;
}

export const USER_DEPARTMENTS = {
  ROAD_MAINTENANCE: 'Road Maintenance',
  GARBAGE_COLLECTION: 'Garbage Collection',
  WATER_SERVICES: 'Water Services',
  ELECTRICAL: 'Electrical',
  PARKS_RECREATION: 'Parks & Recreation',
  TRAFFIC_MANAGEMENT: 'Traffic Management',
  CUSTOMER_SERVICE: 'Customer Service',
  ADMINISTRATION: 'Administration',
  OTHER: 'Other'
} as const;

export const USER_SKILLS = {
  PLUMBING: 'Plumbing',
  ELECTRICAL_WORK: 'Electrical Work',
  ROAD_REPAIR: 'Road Repair',
  GARBAGE_COLLECTION: 'Garbage Collection',
  TREE_TRIMMING: 'Tree Trimming',
  CUSTOMER_SERVICE: 'Customer Service',
  DATA_ANALYSIS: 'Data Analysis',
  SUPERVISION: 'Supervision',
  HEAVY_MACHINERY: 'Heavy Machinery',
  PAINTING: 'Painting',
  WELDING: 'Welding',
  CARPENTRY: 'Carpentry'
} as const;