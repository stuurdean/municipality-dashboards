'use client';

import React, { useState, useEffect } from 'react';
import { User, UserType, UserStats } from '@/types/user';
import { userService } from '@/services/userService';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import UserStatsCard from '@/components/dashboard/UserStatsCard';
import UserModal from '@/components/users/UserModal';
import { authService } from '@/services/authService';


const UsersClient: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<UserType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Load users and stats
  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users when search term, type, or status changes
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm)
      );
    }

    // Filter by user type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(user => user.userType === filterType);
    }

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(user => 
        filterStatus === 'ACTIVE' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterType, filterStatus]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, statsData] = await Promise.all([
        userService.getAllUsers(),
        userService.getUserStats()
      ]);
      
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: any) => {
  try {
    if (editingUser) {
      // Update existing user (no password)
      await userService.updateUser(editingUser.id, userData);
      alert('✅ User updated successfully!');
    } else {
      // Create new user with email/password
      await authService.registerUser(userData);
      alert('✅ User created successfully! They can now login with their email and password.');
      
      // Optional: Send welcome email
      // await authService.sendWelcomeEmail(userData.email, userData.fullName);
    }
    
    setIsModalOpen(false);
    setEditingUser(null);
    await loadUsers(); // Reload users
  } catch (error: any) {
    console.error('Error saving user:', error);
    alert(`❌ ${error.message || 'Failed to save user. Please try again.'}`);
  }
};

  const handleToggleActive = async (user: User) => {
    if (!confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.fullName}?`)) {
      return;
    }

    try {
      if (user.isActive) {
        await userService.deleteUser(user.id);
      } else {
        await userService.activateUser(user.id);
      }
      
      await loadUsers(); // Reload users
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await userService.deleteUser(user.id);
      await loadUsers(); // Reload users
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const columns = [
    {
      key: 'fullName' as keyof User,
      header: 'User',
      render: (value: string, user: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'userType' as keyof User,
      header: 'Role',
      render: (value: UserType) => {
        const config = {
          ADMIN: { color: 'bg-purple-100 text-purple-800', icon: '👑' },
          EMPLOYEE: { color: 'bg-blue-100 text-blue-800', icon: '👷' },
          RESIDENT: { color: 'bg-green-100 text-green-800', icon: '👤' }
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[value].color}`}>
            <span className="mr-1">{config[value].icon}</span>
            {value}
          </span>
        );
      }
    },
    {
      key: 'department' as keyof User,
      header: 'Department',
      render: (value: string) => value || '-'
    },
    {
      key: 'phoneNumber' as keyof User,
      header: 'Phone',
      render: (value: string) => value || '-'
    },
    {
      key: 'isActive' as keyof User,
      header: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? '🟢 Active' : '🔴 Inactive'}
        </span>
      )
    },
    {
      key: 'currentWorkload' as keyof User,
      header: 'Workload',
      render: (value: number, user: User) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                value / user.maxWorkload < 0.6 ? 'bg-green-500' :
                value / user.maxWorkload < 0.85 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(value / user.maxWorkload) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 w-12">
            {value}/{user.maxWorkload}
          </span>
        </div>
      )
    },
    {
      key: 'createdAt' as keyof User,
      header: 'Joined',
      render: (value: Date) => value.toLocaleDateString()
    }
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage municipality users and permissions</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-600 text-lg mr-3">❌</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Users</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={loadUsers}
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage municipality users and permissions</p>
        </div>
        <Button variant="primary" onClick={handleCreateUser}>
          👤 Add New User
        </Button>
      </div>

      {/* Statistics */}
      {stats && <UserStatsCard stats={stats} />}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Search Users
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
              👥 Filter by Role
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as UserType | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="EMPLOYEE">Employees</option>
              <option value="RESIDENT">Residents</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={loadUsers}
              disabled={loading}
              className="w-full"
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        keyField="id"
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
    
        isLoading={loading}
        emptyMessage={loading ? "Loading users..." : "No users found matching your criteria"}
      />

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UsersClient;