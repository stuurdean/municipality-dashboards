'use client';

import React, { useState, useEffect } from 'react';
import { Employee, employeeService } from '@/services/employeeService';
import { Report } from '@/types/reports';
import Button from '@/components/ui/Button';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onAssign: (employeeId: string, notes: string) => Promise<void>;
  currentAssignment?: string;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  report,
  onAssign,
  currentAssignment
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const allEmployees = await employeeService.getActiveEmployees();
      setEmployees(allEmployees);
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(allEmployees.map(emp => emp.department).filter(Boolean))] as string[];
      setDepartments(['all', ...uniqueDepartments]);
      
      setFilteredEmployees(allEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = employees;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }
    
    setFilteredEmployees(filtered);
  }, [searchTerm, selectedDepartment, employees]);

  const handleAssign = async () => {
    if (!selectedEmployee) return;
    
    try {
      setIsLoading(true);
      await onAssign(selectedEmployee, assignmentNotes);
      onClose();
      // Reset form
      setSelectedEmployee('');
      setAssignmentNotes('');
      setSearchTerm('');
      setSelectedDepartment('all');
    } catch (error) {
      console.error('Error assigning report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkloadPercentage = (employee: Employee) => {
    return (employee.currentWorkload / employee.maxWorkload) * 100;
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage < 60) return 'bg-green-500';
    if (percentage < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getWorkloadText = (employee: Employee) => {
    const percentage = getWorkloadPercentage(employee);
    if (percentage < 60) return 'Light workload';
    if (percentage < 85) return 'Moderate workload';
    return 'Heavy workload';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Assign Report</h2>
              <p className="text-blue-100">{report.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Current Assignment */}
          {currentAssignment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-yellow-600 text-lg mr-2">⚠️</span>
                <div>
                  <p className="text-yellow-800 font-medium">Currently assigned to:</p>
                  <p className="text-yellow-700">{currentAssignment}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search Employees
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏢 Filter by Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.filter(dept => dept !== 'all').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Available Employees ({filteredEmployees.length})
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-500">No employees found</p>
                <p className="text-gray-400 text-sm">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedEmployee === employee.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                    onClick={() => setSelectedEmployee(employee.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {employee.fullName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{employee.fullName}</h4>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                          {employee.department && (
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs mt-1">
                              🏢 {employee.department}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getWorkloadColor(getWorkloadPercentage(employee))}`}
                              style={{ width: `${getWorkloadPercentage(employee)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {employee.currentWorkload}/{employee.maxWorkload}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{getWorkloadText(employee)}</p>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    {employee.skills && employee.skills.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {employee.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Assignment Notes (Optional)
            </label>
            <textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="Add any specific instructions or notes for the assigned employee..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!selectedEmployee || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </span>
              ) : (
                `Assign to Employee`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;