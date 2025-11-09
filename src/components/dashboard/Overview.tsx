'use client';

import React from 'react';
import { User } from '@/types/auth';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface OverviewProps {
  user: User;
}

const Overview: React.FC<OverviewProps> = ({ user }) => {
  const stats = [
    {
      title: 'Pending Requests',
      value: '24',
      change: '+12%',
      positive: false,
      icon: '📥'
    },
    {
      title: 'In Progress',
      value: '18',
      change: '+5%',
      positive: true,
      icon: '🔄'
    },
    {
      title: 'Resolved Today',
      value: '8',
      change: '+3%',
      positive: true,
      icon: '✅'
    },
    {
      title: 'Total Users',
      value: '1,247',
      change: '+2%',
      positive: true,
      icon: '👥'
    },
  ];

  const quickActions = [
    {
      title: 'View Requests',
      description: 'Check new service requests',
      href: '/dashboard/requests',
      icon: '📋',
      allowed: ['ADMIN', 'EMPLOYEE']
    },
    {
      title: 'Analytics',
      description: 'View reports and insights',
      href: '/dashboard/analytics',
      icon: '📈',
      allowed: ['ADMIN', 'EMPLOYEE']
    },
    {
      title: 'Map View',
      description: 'See requests on map',
      href: '/dashboard/map',
      icon: '🗺️',
      allowed: ['ADMIN', 'EMPLOYEE']
    },
    {
      title: 'Manage Users',
      description: 'User management panel',
      href: '/dashboard/users',
      icon: '👤',
      allowed: ['ADMIN']
    },
  ];

  const filteredActions = quickActions.filter(action => 
    action.allowed.includes(user.userType)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#130160] to-[#3A0088] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.fullName || user.email}! 👋
        </h1>
        <p className="text-blue-100">
          {user.userType === 'ADMIN' 
            ? 'You have full administrative access to the municipality system.'
            : 'Manage service requests and assist residents efficiently.'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from yesterday
                </p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Button variant="secondary" size="sm">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✅</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pothole repair completed</p>
              <p className="text-xs text-gray-500">Main Street • 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">📋</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New garbage collection request</p>
              <p className="text-xs text-gray-500">Oak Avenue • 4 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;