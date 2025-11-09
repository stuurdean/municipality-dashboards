// components/dashboard/StatsCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
  icon: 'users' | 'files' | 'revenue' | 'projects';
}

const iconMap = {
  users: '👥',
  files: '📋',
  revenue: '💰',
  projects: '🚧'
};

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  description, 
  icon 
}) => {
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
        <div className="flex-shrink-0 text-2xl">
          {iconMap[icon]}
        </div>
      </div>
    </div>
  );
};