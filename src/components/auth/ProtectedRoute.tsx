'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // 🔒 Check if user has proper role
    if (!loading && user && user.userType !== 'ADMIN' && user.userType !== 'EMPLOYEE') {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 🔒 Only render children if user is ADMIN or EMPLOYEE
  if (user && (user.userType === 'ADMIN' || user.userType === 'EMPLOYEE')) {
    return <>{children}</>;
  }

  return null;
};