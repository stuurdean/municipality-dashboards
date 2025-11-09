// app/assignments/AssignmentsClient.tsx
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
  Filter, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  User as UserIcon
} from 'lucide-react';
import Input from '@/components/ui/Input';

interface AssignmentsClientProps {
  user: User;
}

const AssignmentsClient: React.FC<AssignmentsClientProps> = ({ user }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const router = useRouter();

  // Fetch only reports assigned to current user
  useEffect(() => {
    const fetchAssignedReports = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching assigned reports for user:', user.uid);
        
        const allReports = await reportService.getAllReports();
        console.log('📋 All reports:', allReports.length);
        
        // Filter reports assigned to current user
        const assignedReports = allReports.filter(report => 
          report.assignedTo === user.uid
        );
        
        console.log('👤 Assigned reports:', assignedReports.length);
        setReports(assignedReports);
        setFilteredReports(assignedReports);
      } catch (err) {
        console.error('❌ Failed to fetch assigned reports:', err);
        setError('Failed to load your assignments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedReports();
  }, [user.uid]);

  // Apply filters
  useEffect(() => {
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.issueType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, priorityFilter]);

  const handleViewReport = (report: Report) => {
    console.log('Navigating to report:', report.id);
    router.push(`/dashboard/reports/${report.id}`);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const allReports = await reportService.getAllReports();
      const assignedReports = allReports.filter(report => 
        report.assignedTo === user.uid
      );
      setReports(assignedReports);
    } catch (err) {
      console.error('❌ Failed to refresh reports:', err);
      setError('Failed to refresh assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: reports.length,
    inProgress: reports.filter(r => r.status === 'in_progress' || r.status === 'ASSIGNED').length,
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
          {value?.toLowerCase().replace('_', ' ') || 'Unknown'}
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
          ASSIGNED: 'bg-orange-100 text-orange-800',
          resolved: 'bg-green-100 text-green-800',
          closed: 'bg-gray-100 text-gray-800',
          rejected: 'bg-red-100 text-red-800',
          verification_needed: 'bg-indigo-100 text-indigo-800'
        };
        
        const statusKey = value?.toLowerCase() as keyof typeof statusColors;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[statusKey] || 'bg-gray-100 text-gray-800'}`}>
            {value?.replace('_', ' ') || 'Unknown'}
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
        
        const priorityKey = value?.toLowerCase() as keyof typeof priorityColors;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[priorityKey] || 'bg-gray-100 text-gray-800'}`}>
            {value || 'Medium'}
          </span>
        );
      }
    },
    {
      key: 'createdAt' as keyof Report,
      header: 'Created',
      render: (value: Date) => value?.toLocaleDateString() || 'Unknown'
    },
    {
      key: 'aiConfidenceScore' as keyof Report,
      header: 'AI Confidence',
      render: (value: number) => value ? `${(value * 100).toFixed(1)}%` : 'N/A'
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
              <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
              <p className="text-gray-600">Reports assigned to you for resolution</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-600 text-lg mr-3">❌</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Assignments</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-gray-600">
              {loading ? 'Loading your assignments...' : `Showing ${filteredReports.length} of ${reports.length} assigned reports`}
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

      {/* Stats Summary */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Assigned</div>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
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

      {/* Filters */}
      {!loading && reports.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Search Assignments"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, description, type, or location..."
                icon="search"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="ai_processed">AI Processed</option>
                <option value="under_review">Under Review</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
                <option value="verification_needed">Verification Needed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <DataTable
        data={filteredReports}
        columns={columns}
        keyField="id"
        onView={handleViewReport}
        isLoading={loading}
        emptyMessage={
          loading 
            ? "Loading your assignments..." 
            : reports.length === 0 
              ? "You don't have any reports assigned to you yet."
              : "No assignments match your current filters."
        }
      />
    </div>
  );
};

export default AssignmentsClient;