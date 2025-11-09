import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Report } from '@/types/report';
import { useAuth } from './use-auth';

export function useReports(filters = {}) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const reportsRef = collection(db, 'reports');
    let q = query(reportsRef, orderBy('createdAt', 'desc'));

    // Add municipality filter for staff/supervisors
    if (user.customClaims?.municipalityId) {
      q = query(q, where('municipalityId', '==', user.customClaims.municipalityId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, filters]);

  return { reports, loading };
}