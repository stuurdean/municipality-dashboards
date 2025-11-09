import { UserStats } from '@/types/user';
import React from 'react';

interface UserStatsCardProps {
  stats: UserStats;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      color: 'bg-blue-500',
      icon: '👥'
    },
    {
      title: 'Administrators',
      value: stats.byType.ADMIN,
      color: 'bg-purple-500',
      icon: '👑'
    },
    {
      title: 'Employees',
      value: stats.byType.EMPLOYEE,
      color: 'bg-green-500',
      icon: '👷'
    },
    {
      title: 'Residents',
      value: stats.byType.RESIDENT,
      color: 'bg-orange-500',
      icon: '👤'
    },
    {
      title: 'Active',
      value: stats.active,
      color: 'bg-green-500',
      icon: '🟢'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      color: 'bg-red-500',
      icon: '🔴'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
              <span className="text-white text-xl">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStatsCard;