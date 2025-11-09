export interface MunicipalStats {
  totalResidents: number;
  activeCases: number;
  revenue: number;
  pendingRequests: number;
  completedTasks: number;
}

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  contactNumber: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  location: string;
  status: ReportStatus;
  priority: Priority;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export type ReportType = 'complaint' | 'request' | 'incident' | 'suggestion';
export type ReportStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: Date;
  status: AssignmentStatus;
  priority: Priority;
  createdAt: Date;
}

export type AssignmentStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';