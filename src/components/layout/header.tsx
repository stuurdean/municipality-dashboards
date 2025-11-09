'use client';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Municipality Dashboard</h1>
            {user && (
              <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                {user.userType.toLowerCase()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.userType.toLowerCase()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};