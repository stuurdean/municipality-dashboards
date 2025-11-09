'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReportDetailsClient from './ReportDetailsClient';
import { Report } from '@/types/reports';
import { reportService } from '@/services/reportService';

export default function ReportDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user && user.userType !== 'ADMIN' && user.userType !== 'EMPLOYEE') {
      router.push('/login');
      return;
    }

    // Fetch report from Firestore
    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🔄 Fetching report from Firestore with ID:', reportId);
        
        if (!reportId) {
          throw new Error('No report ID provided');
        }

        const reportData = await reportService.getReportById(reportId);
        
        if (reportData) {
          console.log('✅ Report found:', reportData);
          setReport(reportData);
        } else {
          console.log('❌ Report not found in Firestore');
          setError('Report not found');
        }
      } catch (error) {
        console.error('❌ Error fetching report:', error);
        setError('Failed to load report. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && reportId) {
      fetchReport();
    }
  }, [user, loading, router, reportId]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/reports')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">The requested report could not be found.</p>
          <button 
            onClick={() => router.push('/dashboard/reports')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return <ReportDetailsClient user={user} report={report} />;
}