'use client';

import React, { useState, useEffect } from 'react';
import { User, CreateUserDTO, UserType, USER_DEPARTMENTS, USER_SKILLS } from '@/types/user';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userData: any) => Promise<void>;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    userType: 'EMPLOYEE' as UserType,
    municipalityId: 'default-municipality',
    phoneNumber: '',
    department: '',
    skills: [] as string[],
    maxWorkload: 5,
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && isOpen) {
      // Editing existing user
      setFormData({
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        municipalityId: user.municipalityId,
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        skills: user.skills || [],
        maxWorkload: user.maxWorkload,
        password: '',
        confirmPassword: ''
      });
    } else if (isOpen) {
      // Creating new user - reset form
      setFormData({
        email: '',
        fullName: '',
        userType: 'EMPLOYEE',
        municipalityId: 'default-municipality',
        phoneNumber: '',
        department: '',
        skills: [],
        maxWorkload: 5,
        password: '',
        confirmPassword: ''
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.fullName) newErrors.fullName = 'Full name is required';

    if (!user) { // Only validate password for new users
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.userType) newErrors.userType = 'User type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      if (user) {
        // Update existing user (no password change)
        await onSave({
          fullName: formData.fullName,
          userType: formData.userType,
          phoneNumber: formData.phoneNumber,
          department: formData.department,
          skills: formData.skills,
          maxWorkload: formData.maxWorkload
        });
      } else {
        // Create new user with email/password
        const userData = {
          email: formData.email,
          fullName: formData.fullName,
          userType: formData.userType,
          municipalityId: formData.municipalityId,
          phoneNumber: formData.phoneNumber,
          department: formData.department,
          skills: formData.skills,
          maxWorkload: formData.maxWorkload,
          password: formData.password
        };

        await authService.registerUser(userData);
        await onSave(userData); // Refresh the user list
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered' });
      } else if (error.code === 'auth/invalid-email') {
        setErrors({ email: 'Invalid email address' });
      } else if (error.code === 'auth/weak-password') {
        setErrors({ password: 'Password is too weak' });
      } else {
        setErrors({ general: 'Failed to save user. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-municipal-secondary p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {user ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-blue-100">
                {user ? 'Update user information' : 'Add a new user to the system'}
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <Input
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!!user}
                error={errors.email}
                placeholder="user@municipality.gov.za"
                icon="email"
              />

              <Input
                label="Full Name *"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={errors.fullName}
                placeholder="John Doe"
                icon="user"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="+27 12 345 6789"
                icon="search" // You might want to add a phone icon to your icon map
              />
            </div>

            {/* Role & Department */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Role & Department</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type *
                </label>
                <select
                  value={formData.userType}
                  onChange={(e) => handleChange('userType', e.target.value as UserType)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.userType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="EMPLOYEE">👷 Employee</option>
                  <option value="ADMIN">👑 Administrator</option>
                  <option value="RESIDENT">👤 Resident</option>
                </select>
                {errors.userType && <p className="text-red-500 text-sm mt-1">{errors.userType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {Object.entries(userService.getDepartments()).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Max Workload"
                type="number"
                value={formData.maxWorkload.toString()}
                onChange={(e) => handleChange('maxWorkload', parseInt(e.target.value) || 5)}
                  
                min="1"
                max="20"
                icon="calendar" // Using calendar as workload icon, you might want to add a different one
              />
            </div>
          </div>

          {/* Password Section (Only for new users) */}
          {!user && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password *"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={errors.password}
                  placeholder="At least 6 characters"
                  icon="password"
                />

                <Input
                  label="Confirm Password *"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  icon="password"
                />
              </div>
            </div>
          )}

          {/* Skills Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(userService.getSkills()).map(([key, skill]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selected Skills Display */}
          {formData.skills.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Selected Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </form>

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
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {user ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;