'use client';

import { User } from '@/types/auth';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { useState } from 'react';
import { Save, Download, Trash2, Bell, Shield, User as UserIcon, Building } from 'lucide-react';

interface SettingsData {
  general: {
    municipalityName: string;
    contactEmail: string;
    phoneNumber: string;
    address: string;
    website: string;
  };
  notifications: {
    emailRequests: boolean;
    smsAlerts: boolean;
    weeklyReports: boolean;
    assignmentUpdates: boolean;
    systemMaintenance: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAlerts: boolean;
  };
}

export default function SettingsClient({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      municipalityName: 'Local Municipality',
      contactEmail: 'contact@municipality.gov.za',
      phoneNumber: '+27 12 345 6789',
      address: '123 Municipal Street, City Center',
      website: 'www.municipality.gov.za'
    },
    notifications: {
      emailRequests: true,
      smsAlerts: true,
      weeklyReports: false,
      assignmentUpdates: true,
      systemMaintenance: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAlerts: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Settings saved:', settings);
    setIsLoading(false);
    // Add toast notification here
  };

  const handleBackup = () => {
    // Backup functionality
    console.log('Backing up data...');
  };

  const handleClearCache = () => {
    // Clear cache functionality
    console.log('Clearing cache...');
  };

  const updateSettings = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: UserIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure municipality system settings and preferences</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="secondary" 
                className="w-full justify-center"
                onClick={handleBackup}
              >
                <Download className="h-4 w-4 mr-2" />
                Backup Data
              </Button>
              <Button 
                variant="danger" 
                className="w-full justify-center"
                onClick={handleClearCache}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Municipality Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Municipality Name"
                    value={settings.general.municipalityName}
                    onChange={(e) => updateSettings('general', 'municipalityName', e.target.value)}
                  />
                  <TextField
                    label="Contact Email"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSettings('general', 'contactEmail', e.target.value)}
                  />
                  <TextField
                    label="Phone Number"
                    value={settings.general.phoneNumber}
                    onChange={(e) => updateSettings('general', 'phoneNumber', e.target.value)}
                  />
                  <TextField
                    label="Website"
                    value={settings.general.website}
                    onChange={(e) => updateSettings('general', 'website', e.target.value)}
                  />
                  <TextField
                    label="Address"
                    className="md:col-span-2"
                    value={settings.general.address}
                    onChange={(e) => updateSettings('general', 'address', e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-logout Timer</p>
                      <p className="text-sm text-gray-500">Automatically log out users after inactivity</p>
                    </div>
                    <select 
                      className="border rounded-md px-3 py-2 text-sm"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Default Report Priority</p>
                      <p className="text-sm text-gray-500">Default priority level for new service requests</p>
                    </div>
                    <select className="border rounded-md px-3 py-2 text-sm">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium">Email notifications for new requests</p>
                    <p className="text-sm text-gray-500">Receive email alerts when new service requests are submitted</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={settings.notifications.emailRequests}
                    onChange={(e) => updateSettings('notifications', 'emailRequests', e.target.checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium">SMS alerts for high priority issues</p>
                    <p className="text-sm text-gray-500">Get SMS notifications for urgent service requests</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={settings.notifications.smsAlerts}
                    onChange={(e) => updateSettings('notifications', 'smsAlerts', e.target.checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium">Weekly summary reports</p>
                    <p className="text-sm text-gray-500">Receive weekly reports of system activity</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={settings.notifications.weeklyReports}
                    onChange={(e) => updateSettings('notifications', 'weeklyReports', e.target.checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium">Assignment updates</p>
                    <p className="text-sm text-gray-500">Notify when assignments are created or updated</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={settings.notifications.assignmentUpdates}
                    onChange={(e) => updateSettings('notifications', 'assignmentUpdates', e.target.checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">System maintenance alerts</p>
                    <p className="text-sm text-gray-500">Get notified about scheduled system maintenance</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={settings.notifications.systemMaintenance}
                    onChange={(e) => updateSettings('notifications', 'systemMaintenance', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => updateSettings('security', 'twoFactorAuth', e.target.checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium">Login Alerts</p>
                      <p className="text-sm text-gray-500">Get notified of new sign-ins from unknown devices</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={settings.security.loginAlerts}
                      onChange={(e) => updateSettings('security', 'loginAlerts', e.target.checked)}
                    />
                  </div>
                  
                  <div className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Session Timeout</p>
                      <span className="text-sm text-gray-600">{settings.security.sessionTimeout} minutes</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="120" 
                      step="5"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">Automatically log out after period of inactivity</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Password Policy</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Expiry Period (days)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="365"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => updateSettings('security', 'passwordExpiry', parseInt(e.target.value))}
                      className="border rounded-md px-3 py-2 w-32"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-lg">{user?.fullName || 'User'}</p>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.userType?.toLowerCase()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <TextField
                    label="Full Name"
                    defaultValue={user?.fullName || ''}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    defaultValue={user?.email || ''}
                  />
                  <TextField
                    label="Department"
                    defaultValue="Municipal Services"
                  />
                  <TextField
                    label="Position"
                    defaultValue="System Administrator"
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button variant="danger" className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Info Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Version</span>
            <p className="font-medium">1.2.3</p>
          </div>
          <div>
            <span className="text-gray-600">Last Updated</span>
            <p className="font-medium">2024-01-15</p>
          </div>
          <div>
            <span className="text-gray-600">Users Online</span>
            <p className="font-medium">8</p>
          </div>
          <div>
            <span className="text-gray-600">Database Size</span>
            <p className="font-medium">245 MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}