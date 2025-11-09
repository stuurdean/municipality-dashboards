// components/export/ExportModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, FileText, Table, Calendar, User, Filter } from 'lucide-react';
import { ExportFilter, ExportOptions } from '@/types/export';
import { exportService } from '@/services/exportService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

interface Employee {
  id: string;
  name: string;
  department: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  onExportStart,
  onExportComplete 
}) => {
  const [filters, setFilters] = useState<ExportFilter>({});
  const [options, setOptions] = useState<ExportOptions>({
    format: 'excel',
    includeImages: false,
    includeComments: true
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadFilterData();
    }
  }, [isOpen]);

  const loadFilterData = async () => {
    setIsLoadingData(true);
    try {
      const [employeesData, categoriesData, departmentsData] = await Promise.all([
        exportService.getEmployees(),
        exportService.getCategories(),
        exportService.getDepartments()
      ]);

      setEmployees(employeesData);
      setCategories(categoriesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExport = async () => {
    if (!filters.dateRange?.start || !filters.dateRange?.end) {
      alert('Please select a date range');
      return;
    }

    setIsLoading(true);
    onExportStart?.();

    try {
      const exportData = await exportService.getReportsForExport(filters);
      
      if (exportData.length === 0) {
        alert('No reports found matching the selected criteria');
        return;
      }

      const filename = `reports_export_${new Date().toISOString().split('T')[0]}`;

      if (options.format === 'excel') {
        await exportService.exportToExcel(exportData, filename);
      } else {
        await exportService.exportToPDF(exportData, filename);
      }

      onExportComplete?.();
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ExportFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : new Date();
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: date
      }
    }));
  };

  const resetFilters = () => {
    setFilters({});
    setOptions({
      format: 'excel',
      includeImages: false,
      includeComments: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-municipal-secondary p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Download className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Export Reports</h2>
                <p className="text-blue-100 text-sm">Export reports with custom filters</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl"
              disabled={isLoading}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Export Format */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Export Format
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, format: 'excel' }))}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  options.format === 'excel'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Table className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">Excel (CSV)</div>
                <div className="text-sm text-gray-500">Spreadsheet format</div>
              </button>
              
              <button
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, format: 'pdf' }))}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  options.format === 'pdf'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">PDF</div>
                <div className="text-sm text-gray-500">Document format</div>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Date Range *
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="From Date"
                type="date"
                value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                icon="calendar"
              />
              <Input
                label="To Date"
                type="date"
                value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                icon="calendar"
              />
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Filters (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="ai_processed">AI Processed</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                  <option value="verification_needed">Verification Needed</option>
                </select>
              </div>

              {/* Employee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Employee
                </label>
                <select
                  value={filters.assignedTo || 'all'}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingData}
                >
                  <option value="all">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || 'all'}
                  onChange={(e) => handleFilterChange('category', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingData}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={filters.department || 'all'}
                  onChange={(e) => handleFilterChange('department', e.target.value === 'all' ? undefined : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingData}
                >
                  <option value="all">All Departments</option>
                  {departments.map(department => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.includeComments}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Include comments and feedback</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={options.includeImages}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Include image references (PDF only)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={resetFilters}
              disabled={isLoading}
            >
              Reset Filters
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={isLoading || !filters.dateRange?.start || !filters.dateRange?.end}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Reports
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;