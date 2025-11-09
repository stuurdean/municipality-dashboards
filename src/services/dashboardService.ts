// services/dashboardService.ts
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
import { User } from '@/types/user';
import { Report } from '@/types/reports';

interface DashboardStats {
  totalResidents: number;
  totalReports: number;
  revenue: number;
  activeProjects: number;
  recentActivity: Activity[];
  quickActions: QuickAction[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string; // Just store icon name, not JSX
  path: string;
  description: string;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [usersSnapshot, reportsSnapshot, recentActivities] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'reports')),
        this.getRecentActivity()
      ]);

      const users = usersSnapshot.docs.map(doc => doc.data() as User);
      const reports = reportsSnapshot.docs.map(doc => doc.data() as Report);

      const totalResidents = users.filter(user => user.userType === 'RESIDENT').length;
      const totalReports = reports.length;
      const revenue = this.calculateRevenue(reports, users);
      const activeProjects = reports.filter(report => 
        report.status === 'in_progress' || report.status === 'ASSIGNED'
      ).length;

      const quickActions = this.getQuickActions();

      return {
        totalResidents,
        totalReports,
        revenue,
        activeProjects,
        recentActivity: recentActivities,
        quickActions
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  private async getRecentActivity(): Promise<Activity[]> {
    try {
      const reportsQuery = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const reportsSnapshot = await getDocs(reportsQuery);
      const activities: Activity[] = [];

      for (const doc of reportsSnapshot.docs) {
        const report = doc.data();
        
        let userName = 'Unknown User';
        if (report.createdBy) {
          try {
            const userDoc = await getDocs(query(
              collection(db, 'users'),
              where('__name__', '==', report.createdBy)
            ));
            if (!userDoc.empty) {
              userName = userDoc.docs[0].data().fullName || 'Unknown User';
            }
          } catch (error) {
            console.error('Error fetching user name:', error);
          }
        }

        activities.push({
          id: doc.id,
          type: 'report_created',
          description: `New ${report.issueType || 'service'} request from ${userName}`,
          timestamp: report.createdAt?.toDate() || new Date(),
          user: userName
        });
      }

      return activities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  private calculateRevenue(reports: Report[], users: User[]): number {
    const baseRevenue = users.filter(u => u.userType === 'RESIDENT').length * 25;
    const serviceFees = reports.length * 15;
    const projectRevenue = reports.filter(r => 
      r.status === 'in_progress' || r.status === 'ASSIGNED'
    ).length * 500;

    return baseRevenue + serviceFees + projectRevenue;
  }

  private getQuickActions(): QuickAction[] {
    return [
      {
        id: 'create-report',
        label: 'Create Report',
        icon: 'FileText',
        path: '/dashboard/reports/new',
        description: 'Create a new service request'
      },
      {
        id: 'view-analytics',
        label: 'View Analytics',
        icon: 'TrendingUp',
        path: '/analytics',
        description: 'View detailed analytics and insights'
      },
      {
        id: 'manage-users',
        label: 'Manage Users',
        icon: 'Users',
        path: '/dashboard/users',
        description: 'Manage system users and permissions'
      },
      {
        id: 'my-assignments',
        label: 'My Assignments',
        icon: 'UserCheck',
        path: '/assignments',
        description: 'View your assigned tasks and reports'
      }
    ];
  }
}

export const dashboardService = new DashboardService();