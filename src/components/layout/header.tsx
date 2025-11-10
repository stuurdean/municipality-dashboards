'use client';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { 
  LogOut, 
  User, 
  Home,
  Bell,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New report assigned', message: 'You have been assigned a new service report', time: '5 min ago', read: false },
    { id: 2, title: 'Report status updated', message: 'Report #1234 has been completed', time: '1 hour ago', read: false },
    { id: 3, title: 'System maintenance', message: 'Scheduled maintenance this weekend', time: '2 days ago', read: true },
  ]);

  // Simple page title mapping
  const getPageTitle = () => {
    const path = pathname || '';
    
    if (path === '/dashboard' || path === '/') return 'Dashboard';
    if (path.startsWith('/dashboard/reports')) {
      return path.split('/').length > 3 ? 'Report Details' : 'Service Reports';
    }
    if (path.startsWith('/dashboard/users')) return 'User Management';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/assignments')) return 'My Assignments';
    if (path.startsWith('/settings')) return 'Settings';
    
    return 'Municipality Dashboard';
  };

  const pageTitle = getPageTitle();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getUserTypeColor = (userType: string) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      EMPLOYEE: 'bg-blue-100 text-blue-800',
      RESIDENT: 'bg-green-100 text-green-800',
    };
    return colors[userType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Mobile Menu and Page Title */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {pageTitle}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Municipality Management System
                </p>
              </div>
            </div>
            
            {user && (
              <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor(user.userType)}`}>
                <User className="h-3 w-3 mr-1" />
                {user.userType.toLowerCase()}
              </span>
            )}
          </div>
          
          {/* Right Section - User Info and Actions */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center space-x-1"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">{unreadCount} unread</p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                            notification.read 
                              ? 'border-transparent bg-white' 
                              : 'border-blue-500 bg-blue-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="inline-block h-2 w-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-center justify-center"
                      onClick={() => setShowNotifications(false)}
                    >
                      Mark all as read
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                  {user?.fullName || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.userType.toLowerCase()}
                </p>
              </div>
              
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 hidden sm:flex"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </Button>

              {/* Mobile Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center sm:hidden"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close notifications when clicking outside */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
};