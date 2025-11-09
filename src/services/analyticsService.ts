// services/analyticsService.ts
import { 
  AnalyticsOverview, 
  ReportTrend, 
  DepartmentStats, 
  UserPerformance, 
  CategoryStats,
  TimeRange 
} from '@/types/analytics';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Define status constants locally to avoid imports
const REPORT_STATUS = {
  SUBMITTED: 'submitted',
  AI_PROCESSED: 'ai_processed',
  UNDER_REVIEW: 'under_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  VERIFICATION_NEEDED: 'verification_needed',
  ASSIGNED: 'ASSIGNED'
} as const;

class AnalyticsService {
  
  async getOverview(timeRange: string = '7d'): Promise<AnalyticsOverview> {
    const dateRange = this.getDateRange(timeRange);
    
    try {
      const reportsQuery = query(
        collection(db, 'reports'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end)
      );

      const usersQuery = query(
        collection(db, 'users'),
        where('userType', 'in', ['EMPLOYEE', 'ADMIN'])
      );

      const [reportsSnapshot, usersSnapshot, allReportsSnapshot] = await Promise.all([
        getDocs(reportsQuery),
        getDocs(usersQuery),
        getDocs(collection(db, 'reports'))
      ]);

      const reports = reportsSnapshot.docs.map(doc => doc.data());
      const allReports = allReportsSnapshot.docs.map(doc => doc.data());
      const activeUsers = usersSnapshot.docs.map(doc => doc.data());

      const resolvedReports = reports.filter(report => 
        report.status === REPORT_STATUS.RESOLVED || report.status === REPORT_STATUS.CLOSED
      ).length;

      const pendingReports = reports.filter(report => 
        report.status === REPORT_STATUS.ASSIGNED || 
        report.status === REPORT_STATUS.IN_PROGRESS ||
        report.status === REPORT_STATUS.UNDER_REVIEW ||
        report.status === REPORT_STATUS.AI_PROCESSED ||
        report.status === REPORT_STATUS.VERIFICATION_NEEDED
      ).length;

      // Calculate average resolution time from resolved reports
      const resolvedReportsWithTime = allReports.filter(report => 
        (report.status === REPORT_STATUS.RESOLVED || report.status === REPORT_STATUS.CLOSED) && 
        report.resolvedAt
      );
      
      const totalResolutionTime = resolvedReportsWithTime.reduce((total, report) => {
        const created = report.createdAt.toDate();
        const resolved = report.resolvedAt.toDate();
        const diffTime = Math.abs(resolved.getTime() - created.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return total + diffDays;
      }, 0);

      const averageResolutionTime = resolvedReportsWithTime.length > 0 
        ? totalResolutionTime / resolvedReportsWithTime.length 
        : 0;

      return {
        totalReports: reports.length,
        resolvedReports,
        pendingReports,
        activeUsers: activeUsers.length,
        averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
        satisfactionRate: this.calculateSatisfactionRate(reports)
      };
    } catch (error) {
      console.error('Error fetching overview data:', error);
      return {
        totalReports: 0,
        resolvedReports: 0,
        pendingReports: 0,
        activeUsers: 0,
        averageResolutionTime: 0,
        satisfactionRate: 0
      };
    }
  }

  async getReportTrends(timeRange: string = '7d'): Promise<ReportTrend[]> {
    const dateRange = this.getDateRange(timeRange);
    
    try {
      const reportsQuery = query(
        collection(db, 'reports'),
        where('createdAt', '>=', dateRange.start),
        where('createdAt', '<=', dateRange.end),
        orderBy('createdAt', 'asc')
      );

      const reportsSnapshot = await getDocs(reportsQuery);
      const reports = reportsSnapshot.docs.map(doc => doc.data());

      // Group reports by date
      const reportsByDate = reports.reduce((acc, report) => {
        const date = report.createdAt.toDate().toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { created: 0, resolved: 0, pending: 0 };
        }
        acc[date].created++;
        
        if (report.status === REPORT_STATUS.RESOLVED || report.status === REPORT_STATUS.CLOSED) {
          acc[date].resolved++;
        } else if (
          report.status === REPORT_STATUS.ASSIGNED || 
          report.status === REPORT_STATUS.IN_PROGRESS ||
          report.status === REPORT_STATUS.UNDER_REVIEW ||
          report.status === REPORT_STATUS.AI_PROCESSED ||
          report.status === REPORT_STATUS.VERIFICATION_NEEDED
        ) {
          acc[date].pending++;
        }
        
        return acc;
      }, {} as Record<string, { created: number; resolved: number; pending: number }>);

      // Fill in all dates in the range
      const trends: ReportTrend[] = [];
      const currentDate = new Date(dateRange.start.toDate());
      const endDate = new Date(dateRange.end.toDate());
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = reportsByDate[dateStr] || { created: 0, resolved: 0, pending: 0 };
        
        trends.push({
          date: dateStr,
          created: dayData.created,
          resolved: dayData.resolved,
          pending: dayData.pending
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return trends;
    } catch (error) {
      console.error('Error fetching report trends:', error);
      return [];
    }
  }

  async getDepartmentStats(): Promise<DepartmentStats[]> {
    try {
      const [reportsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'reports')),
        getDocs(query(collection(db, 'users'), where('userType', 'in', ['EMPLOYEE', 'ADMIN'])))
      ]);

      const reports = reportsSnapshot.docs.map(doc => doc.data());
      const users = usersSnapshot.docs.map(doc => doc.data());

      // Group by department
      const departmentStats: Record<string, DepartmentStats> = {};

      reports.forEach(report => {
        const department = report.assignedDepartment || 'Unassigned';
        
        if (!departmentStats[department]) {
          departmentStats[department] = {
            department,
            totalReports: 0,
            resolved: 0,
            averageResolutionTime: 0
          };
        }

        departmentStats[department].totalReports++;
        
        if (report.status === REPORT_STATUS.RESOLVED || report.status === REPORT_STATUS.CLOSED) {
          departmentStats[department].resolved++;
        }
      });

      // Calculate average resolution time per department
      Object.keys(departmentStats).forEach(dept => {
        const deptReports = reports.filter(report => 
          report.assignedDepartment === dept && 
          (report.status === REPORT_STATUS.RESOLVED || report.status === REPORT_STATUS.CLOSED) && 
          report.resolvedAt
        );
        
        if (deptReports.length > 0) {
          const totalTime = deptReports.reduce((total, report) => {
            const created = report.createdAt.toDate();
            const resolved = report.resolvedAt.toDate();
            const diffDays = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            return total + diffDays;
          }, 0);
          
          departmentStats[dept].averageResolutionTime = Math.round((totalTime / deptReports.length) * 10) / 10;
        }
      });

      return Object.values(departmentStats)
        .filter(dept => dept.department !== 'Unassigned')
        .sort((a, b) => b.totalReports - a.totalReports);
    } catch (error) {
      console.error('Error fetching department stats:', error);
      return [];
    }
  }

  async getUserPerformance(): Promise<UserPerformance[]> {
    try {
      const [reportsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'reports')),
        getDocs(query(collection(db, 'users'), where('userType', 'in', ['EMPLOYEE', 'ADMIN'])))
      ]);

      const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const userPerformance: UserPerformance[] = users.map(user => {
        const userReports = reports.filter(report => report.assignedTo === user.id);
        const completedReports = userReports.filter(report => 
          report.status === REPORT_STATUS.RESOLVED || report.status === REPORT_STATUS.CLOSED
        );
        
        const completedWithTime = completedReports.filter(report => report.resolvedAt);
        const totalResolutionTime = completedWithTime.reduce((total, report) => {
          const created = report.createdAt.toDate();
          const resolved = report.resolvedAt.toDate();
          const diffDays = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return total + diffDays;
        }, 0);

        const averageResolutionTime = completedWithTime.length > 0 
          ? Math.round((totalResolutionTime / completedWithTime.length) * 10) / 10 
          : 0;

        const completionRate = userReports.length > 0 
          ? Math.round((completedReports.length / userReports.length) * 100 * 10) / 10 
          : 0;

        return {
          userId: user.id,
          userName: user.fullName || 'Unknown User',
          department: user.department || 'Unassigned',
          assignedReports: userReports.length,
          completedReports: completedReports.length,
          completionRate,
          averageResolutionTime
        };
      });

      return userPerformance
        .filter(user => user.assignedReports > 0)
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching user performance:', error);
      return [];
    }
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    try {
      const reportsQuery = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(1000)
      );

      const reportsSnapshot = await getDocs(reportsQuery);
      const reports = reportsSnapshot.docs.map(doc => doc.data());

      // Get current period (last 30 days) and previous period (30-60 days ago) for trend calculation
      const now = new Date();
      const currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const previousPeriodEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const currentReports = reports.filter(report => 
        report.createdAt.toDate() >= currentPeriodStart
      );
      
      const previousReports = reports.filter(report => 
        report.createdAt.toDate() >= previousPeriodStart && 
        report.createdAt.toDate() < previousPeriodEnd
      );

      const currentCounts = currentReports.reduce((acc, report) => {
        const category = report.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const previousCounts = previousReports.reduce((acc, report) => {
        const category = report.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categoryStats: CategoryStats[] = Object.entries(currentCounts).map(([category, count]) => {
        const previousCount = previousCounts[category] || 0;
        const trend = previousCount > 0 
          ? Math.round(((count - previousCount) / previousCount) * 100) 
          : count > 0 ? 100 : 0;

        return {
          category,
          count,
          trend
        };
      });

      return categoryStats.sort((a, b) => b.count - a.count).slice(0, 8);
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return [];
    }
  }

  private getDateRange(timeRange: string): { start: Timestamp; end: Timestamp } {
    const now = new Date();
    const end = new Date();
    const start = new Date();

    switch (timeRange) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return {
      start: Timestamp.fromDate(start),
      end: Timestamp.fromDate(end)
    };
  }

  private calculateSatisfactionRate(reports: any[]): number {
    const ratedReports = reports.filter(report => 
      report.rating !== undefined && report.rating !== null
    );
    
    if (ratedReports.length === 0) return 0;
    
    const totalRating = ratedReports.reduce((sum, report) => sum + (report.rating || 0), 0);
    return Math.round((totalRating / ratedReports.length) * 10) / 10;
  }

  getTimeRanges(): TimeRange[] {
    return [
      { label: 'Last 7 days', value: '7d', days: 7 },
      { label: 'Last 30 days', value: '30d', days: 30 },
      { label: 'Last 90 days', value: '90d', days: 90 }
    ];
  }
}

export const analyticsService = new AnalyticsService();