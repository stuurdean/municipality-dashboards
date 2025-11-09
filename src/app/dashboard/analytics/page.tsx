// app/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { 
  AnalyticsOverview, 
  ReportTrend, 
  DepartmentStats, 
  UserPerformance, 
  CategoryStats
} from '@/types/analytics';
import MetricCard from '@/components/analytics/MetricCard';
import LineChart from '@/components/analytics/LineChart';
import BarChart from '@/components/analytics/BarChart';
import Button from '@/components/ui/Button';

const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<ReportTrend[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const timeRanges = analyticsService.getTimeRanges();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        overviewData,
        trendsData,
        departmentData,
        userData,
        categoryData
      ] = await Promise.all([
        analyticsService.getOverview(timeRange),
        analyticsService.getReportTrends(timeRange),
        analyticsService.getDepartmentStats(),
        analyticsService.getUserPerformance(),
        analyticsService.getCategoryStats()
      ]);

      setOverview(overviewData);
      setTrends(trendsData);
      setDepartmentStats(departmentData);
      setUserPerformance(userData);
      setCategoryStats(categoryData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const data = {
      overview,
      trends,
      departmentStats,
      userPerformance,
      categoryStats,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (isLoading && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">
                  {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <Button 
                variant="secondary" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="secondary" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Reports"
            value={overview?.totalReports?.toLocaleString() || '0'}
            description={`${timeRanges.find(r => r.value === timeRange)?.label}`}
            icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
          />
          <MetricCard
            title="Resolved"
            value={overview?.resolvedReports?.toLocaleString() || '0'}
            description={`${((overview?.resolvedReports || 0) / (overview?.totalReports || 1) * 100).toFixed(1)}% resolution rate`}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          />
          <MetricCard
            title="Active Staff"
            value={overview?.activeUsers?.toLocaleString() || '0'}
            description="Employees and administrators"
            icon={<Users className="h-6 w-6 text-purple-600" />}
          />
          <MetricCard
            title="Avg. Resolution Time"
            value={`${overview?.averageResolutionTime || 0}d`}
            description="Days to resolve reports"
            icon={<Clock className="h-6 w-6 text-orange-600" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Report Trends */}
          <LineChart data={trends} timeRange={timeRange} />

          {/* Department Performance */}
          <BarChart data={departmentStats} />
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
              <span className="text-sm text-gray-500">{userPerformance.length} active staff</span>
            </div>
            <div className="space-y-4">
              {userPerformance.length > 0 ? (
                userPerformance.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.userName}</p>
                        <p className="text-sm text-gray-600">{user.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{user.completionRate}%</p>
                      <p className="text-sm text-gray-600">{user.completedReports}/{user.assignedReports} completed</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No performance data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Categories</h3>
            <div className="space-y-3">
              {categoryStats.length > 0 ? (
                categoryStats.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-gray-700">{category.category}</span>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold text-gray-900">{category.count}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        category.trend >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.trend >= 0 ? '+' : ''}{category.trend}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;