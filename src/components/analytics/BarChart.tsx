// components/analytics/BarChart.tsx
import React from 'react';
import { DepartmentStats } from '@/types/analytics';

interface BarChartProps {
  data: DepartmentStats[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxReports = Math.max(...data.map(dept => dept.totalReports));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Performance</h3>
      
      <div className="space-y-4">
        {data.map((dept, index) => {
          const resolutionRate = (dept.resolved / dept.totalReports) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{dept.department}</span>
                <span className="text-gray-600">
                  {dept.resolved}/{dept.totalReports} ({resolutionRate.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${resolutionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Avg. {dept.averageResolutionTime} days to resolve</span>
                <span>{dept.totalReports} total reports</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;