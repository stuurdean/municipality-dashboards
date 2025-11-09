// types/analytics.ts
export interface AnalyticsOverview {
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;
  activeUsers: number;
  averageResolutionTime: number;
  satisfactionRate: number;
}

export interface ReportTrend {
  date: string;
  created: number;
  resolved: number;
  pending: number;
}

export interface DepartmentStats {
  department: string;
  totalReports: number;
  resolved: number;
  averageResolutionTime: number;
}

export interface UserPerformance {
  userId: string;
  userName: string;
  department: string;
  assignedReports: number;
  completedReports: number;
  completionRate: number;
  averageResolutionTime: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  trend: number;
}

export interface TimeRange {
  label: string;
  value: string;
  days: number;
}