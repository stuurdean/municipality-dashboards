import React from 'react';
import { FaUsers, FaFileAlt, FaDollarSign, FaHardHat } from 'react-icons/fa';

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  description: string;
  icon: 'users' | 'files' | 'revenue' | 'projects';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  description,
  icon,
}) => {
  const isPositive = change >= 0;

  const iconMap = {
    users: <FaUsers className="h-6 w-6 text-white" />,
    files: <FaFileAlt className="h-6 w-6 text-white" />,
    revenue: <FaDollarSign className="h-6 w-6 text-white" />,
    projects: <FaHardHat className="h-6 w-6 text-white" />,
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-municipal-primary rounded-lg flex items-center justify-center">
              {iconMap[icon]}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-gray-500"> {description}</span>
        </div>
      </div>
    </div>
  );
};