'use client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          
          {/* Footer (optional) */}
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>© 2024 Municipality System. All rights reserved.</span>
              <span>v1.0.0</span>
            </div>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}