// components/analytics/LineChart.tsx
import React from 'react';
import { ReportTrend } from '@/types/analytics';

interface LineChartProps {
  data: ReportTrend[];
  timeRange: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, timeRange }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.created, d.resolved, d.pending]));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Trends</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No trend data available for the selected period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Report Trends</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Created</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Resolved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Pending</span>
          </div>
        </div>
      </div>
      
      <div className="h-64 flex items-end space-x-1 pb-4 overflow-x-auto">
        {data.map((item, index) => (
          <div key={index} className="flex-1 min-w-[40px] flex flex-col items-center space-y-2">
            <div className="flex items-end space-x-1 w-full justify-center" style={{ height: '180px' }}>
              <div 
                className="w-3 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                style={{ height: `${maxValue > 0 ? (item.created / maxValue) * 160 : 0}px` }}
                title={`Created: ${item.created} on ${new Date(item.date).toLocaleDateString()}`}
              />
              <div 
                className="w-3 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                style={{ height: `${maxValue > 0 ? (item.resolved / maxValue) * 160 : 0}px` }}
                title={`Resolved: ${item.resolved} on ${new Date(item.date).toLocaleDateString()}`}
              />
              <div 
                className="w-3 bg-yellow-500 rounded-t hover:bg-yellow-600 transition-colors cursor-pointer"
                style={{ height: `${maxValue > 0 ? (item.pending / maxValue) * 160 : 0}px` }}
                title={`Pending: ${item.pending} on ${new Date(item.date).toLocaleDateString()}`}
              />
            </div>
            <span className="text-xs text-gray-500 truncate w-full text-center">
              {new Date(item.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;