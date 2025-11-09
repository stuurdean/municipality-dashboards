'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { Report } from '@/types/reports';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { reportService } from '@/services/reportService';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react';

interface ReportsClientProps {
  user: User;
}

const ReportsClient: React.FC<ReportsClientProps> = ({ user }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch reports from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Starting to fetch reports...');
        
        const reportsData = await reportService.getAllReports();
        console.log('📋 Reports fetched:', reportsData);
        
        setReports(reportsData);
      } catch (err) {
        console.error('❌ Failed to fetch reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleViewReport = (report: Report) => {
    console.log('Navigating to report:', report.id);
    router.push(`/dashboard/reports/${report.id}`);
  };

  const handleEditReport = (report: Report) => {
    console.log('Edit report:', report);
    // Open edit modal or navigate to edit page
  };

  const handleDeleteReport = (report: Report) => {
    if (confirm('Are you sure you want to delete this report?')) {
      console.log('Delete report:', report.id);
      // Implement delete functionality
      setReports(prev => prev.filter(r => r.id !== report.id));
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const reportsData = await reportService.getAllReports();
      setReports(reportsData);
    } catch (err) {
      console.error('❌ Failed to refresh reports:', err);
      setError('Failed to refresh reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: reports.length,
    inProgress: reports.filter(r => r.status === 'in_progress' || r.status === 'ASSIGNED').length,
    critical: reports.filter(r => r.priority === 'critical').length,
    resolved: reports.filter(r => r.status === 'resolved' || r.status === 'closed').length,
    pending: reports.filter(r => 
      r.status === 'submitted' || 
      r.status === 'ai_processed' || 
      r.status === 'under_review' ||
      r.status === 'verification_needed'
    ).length
  };

  const columns = [
    {
      key: 'title' as keyof Report,
      header: 'Title',
      render: (value: string, report: Report) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{report.address}</div>
        </div>
      )
    },
    {
      key: 'issueType' as keyof Report,
      header: 'Type',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {value.toLowerCase().replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'status' as keyof Report,
      header: 'Status',
      render: (value: string) => {
        const statusColors = {
          submitted: 'bg-yellow-100 text-yellow-800',
          ai_processed: 'bg-blue-100 text-blue-800',
          under_review: 'bg-purple-100 text-purple-800',
          in_progress: 'bg-orange-100 text-orange-800',
          resolved: 'bg-green-100 text-green-800',
          closed: 'bg-gray-100 text-gray-800',
          rejected: 'bg-red-100 text-red-800',
          verification_needed: 'bg-indigo-100 text-indigo-800'
        };
        
        const statusKey = value.toLowerCase() as keyof typeof statusColors;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[statusKey] || 'bg-gray-100 text-gray-800'}`}>
            {value.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      key: 'priority' as keyof Report,
      header: 'Priority',
      render: (value: string) => {
        const priorityColors = {
          critical: 'bg-red-100 text-red-800',
          high: 'bg-orange-100 text-orange-800',
          medium: 'bg-yellow-100 text-yellow-800',
          low: 'bg-green-100 text-green-800'
        };
        
        const priorityKey = value.toLowerCase() as keyof typeof priorityColors;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[priorityKey] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'assignedTo' as keyof Report,
      header: 'Assigned To',
      render: (value: string) => value || 'Unassigned'
    },
    {
      key: 'createdAt' as keyof Report,
      header: 'Created',
      render: (value: Date) => value.toLocaleDateString()
    },
    {
      key: 'aiConfidenceScore' as keyof Report,
      header: 'AI Confidence',
      render: (value: number) => `${(value * 100).toFixed(1)}%`
    }
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Reports</h1>
              <p className="text-gray-600">Manage and review all service requests</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-600 text-lg mr-3">❌</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Reports</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-xl">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Reports</h1>
            <p className="text-gray-600">
              {loading ? 'Loading reports...' : `Showing ${reports.length} reports`}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">

          <Button 
            variant="secondary" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Summary - Updated Style */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-sm text-gray-600">Critical Priority</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <DataTable
        data={reports}
        columns={columns}
        keyField="id"
        onView={handleViewReport}
        onEdit={user.userType === 'ADMIN' ? handleEditReport : undefined}
        onDelete={user.userType === 'ADMIN' ? handleDeleteReport : undefined}
        isLoading={loading}
        emptyMessage={loading ? "Loading reports..." : "No service reports found"}
      />
    </div>
  );
};

export default ReportsClient;