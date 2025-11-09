'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardService } from '@/services/dashboardService';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Hammer,
  RefreshCw,
  Clock,
  ArrowRight,
  UserCheck,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

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
  icon: string;
  path: string;
  description: string;
}

// Icon mapping for quick actions
const iconMap: { [key: string]: React.ReactNode } = {
  FileText: <FileText className="h-5 w-5 text-blue-600" />,
  TrendingUp: <TrendingUp className="h-5 w-5 text-purple-600" />,
  Users: <Users className="h-5 w-5 text-green-600" />,
  UserCheck: <UserCheck className="h-5 w-5 text-orange-600" />
};

// StatsCard component with proper icons
const StatsCardWithIcons: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  description?: string;
  icon: React.ReactNode;
}> = ({ title, value, change, description, icon }) => {
  const isPositive = change && change >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0 p-3 bg-blue-50 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await dashboardService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const handleQuickAction = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <p className="mt-2 text-gray-600">Welcome to your municipality dashboard</p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled
            className="flex items-center space-x-2 text-gray-400"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </button>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <p className="mt-2 text-gray-600">Welcome to your municipality dashboard</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="mt-2 text-red-600 hover:text-red-800 underline flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Define dashboard stats with proper icons
  const dashboardStats = [
    {
      title: 'Total Residents',
      value: stats.totalResidents.toLocaleString(),
      change: 12,
      description: 'Registered residents in the system',
      icon: <Users className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'Service Requests',
      value: stats.totalReports.toLocaleString(),
      change: 8,
      description: 'Total service requests submitted',
      icon: <FileText className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue),
      change: -2,
      description: 'Monthly projected revenue',
      icon: <DollarSign className="h-6 w-6 text-purple-600" />
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects.toString(),
      change: 4,
      description: 'Currently active service projects',
      icon: <Hammer className="h-6 w-6 text-orange-600" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Municipality Overview</h1>
          <p className="mt-2 text-gray-600">Welcome to your dashboard - Real-time insights</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatsCardWithIcons key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <span className="text-sm text-gray-500">Most used</span>
          </div>
          <div className="space-y-3">
            {stats.quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.path)}
                className="w-full flex items-center justify-between p-4 text-left text-gray-700 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-200 group-hover:border-blue-200">
                    {iconMap[action.icon]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">
                      {action.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {action.description}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}