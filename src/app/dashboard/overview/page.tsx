'use client';
import { StatsCard } from '@/components/dashboard/StatsCard';

const stats = [
  {
    title: 'Total Residents',
    value: '45,231',
    change: 12,
    description: 'From last month',
    icon: 'users' as const
  },
  {
    title: 'Service Requests',
    value: '2,845',
    change: 8,
    description: 'From last month',
    icon: 'files' as const
  },
  {
    title: 'Revenue',
    value: '$45,231',
    change: -2,
    description: 'From last month',
    icon: 'revenue' as const
  },
  {
    title: 'Active Projects',
    value: '12',
    change: 4,
    description: 'From last month',
    icon: 'projects' as const
  }
];

export default function OverViewPage() {
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="mt-2 text-gray-600">Welcome to your municipality dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

     
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {['New service request', 'Project update', 'Revenue report', 'Maintenance scheduled'].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span className="text-sm text-gray-600">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {['Create Report', 'View Analytics', 'Manage Users', 'System Settings'].map((action, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}