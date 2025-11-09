'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { Report } from '@/types/reports';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { reportService } from '@/services/reportService';

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Reports</h1>
            <p className="text-gray-600">Manage and review all service requests</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-600 text-lg mr-3">❌</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Reports</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Reports</h1>
          <p className="text-gray-600">
            {loading ? 'Loading reports...' : `Showing ${reports.length} reports`}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" disabled={loading}>
            Export
          </Button>
          <Button variant="primary" disabled={loading}>
            + New Report
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-orange-600">
              {reports.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">
              {reports.filter(r => r.priority === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
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