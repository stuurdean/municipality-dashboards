// services/exportService.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ExportFilter, ReportExportData } from '@/types/export';
import { User } from '@/types/user';

// Status constants to match your system
const REPORT_STATUS = {
  SUBMITTED: 'submitted',
  AI_PROCESSED: 'ai_processed',
  UNDER_REVIEW: 'under_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  VERIFICATION_NEEDED: 'verification_needed',
  ASSIGNED: 'ASSIGNED'
};

class ExportService {
  async getReportsForExport(filters: ExportFilter): Promise<ReportExportData[]> {
    try {
      let reportsQuery = query(collection(db, 'reports'));

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        reportsQuery = query(reportsQuery, where('status', '==', filters.status));
      }

      // Apply assignedTo filter
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        reportsQuery = query(reportsQuery, where('assignedTo', '==', filters.assignedTo));
      }

      // Apply date range filter
      if (filters.dateRange) {
        reportsQuery = query(
          reportsQuery,
          where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.start)),
          where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.end))
        );
      }

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        reportsQuery = query(reportsQuery, where('category', '==', filters.category));
      }

      // Apply department filter
      if (filters.department && filters.department !== 'all') {
        reportsQuery = query(reportsQuery, where('assignedDepartment', '==', filters.department));
      }

      // Order by creation date
      reportsQuery = query(reportsQuery, orderBy('createdAt', 'desc'));

      const reportsSnapshot = await getDocs(reportsQuery);
      const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get users for assignedTo names
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.reduce((acc, doc) => {
        const user = doc.data() as User;
        acc[doc.id] = user.fullName;
        return acc;
      }, {} as Record<string, string>);

      // Transform data for export
      const exportData: ReportExportData[] = reports.map(report => ({
        id: report.id,
        title: report.title || 'No Title',
        description: report.description || '',
        category: report.category || 'Uncategorized',
        status: report.status || 'Unknown',
        priority: report.priority || 'MEDIUM',
        assignedTo: users[report.assignedTo] || 'Unassigned',
        assignedDepartment: report.assignedDepartment || 'Unassigned',
        createdAt: report.createdAt?.toDate().toLocaleDateString() || 'Unknown',
        resolvedAt: report.resolvedAt?.toDate().toLocaleDateString(),
        location: report.location?.address || 'No Location',
        rating: report.rating,
        feedback: report.feedback
      }));

      return exportData;
    } catch (error) {
      console.error('Error fetching reports for export:', error);
      throw new Error('Failed to fetch reports for export');
    }
  }

  async getEmployees(): Promise<{ id: string; name: string; department: string }[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('userType', 'in', ['EMPLOYEE', 'ADMIN'])
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      return usersSnapshot.docs.map(doc => {
        const user = doc.data() as User;
        return {
          id: doc.id,
          name: user.fullName,
          department: user.department || 'Unassigned'
        };
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const categories = new Set<string>();
      
      reportsSnapshot.docs.forEach(doc => {
        const report = doc.data();
        if (report.category) {
          categories.add(report.category);
        }
      });

      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getDepartments(): Promise<string[]> {
    try {
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const departments = new Set<string>();
      
      reportsSnapshot.docs.forEach(doc => {
        const report = doc.data();
        if (report.assignedDepartment) {
          departments.add(report.assignedDepartment);
        }
      });

      return Array.from(departments).sort();
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  // Export to Excel
  async exportToExcel(data: ReportExportData[], filename: string): Promise<void> {
    // For Excel export, we'll use a simple CSV approach
    // You can integrate with a proper Excel library like xlsx if needed
    const headers = [
      'ID', 'Title', 'Description', 'Category', 'Status', 'Priority',
      'Assigned To', 'Department', 'Created Date', 'Resolved Date',
      'Location', 'Rating', 'Feedback'
    ];

    const csvData = data.map(report => [
      report.id,
      `"${report.title.replace(/"/g, '""')}"`,
      `"${report.description.replace(/"/g, '""')}"`,
      report.category,
      report.status,
      report.priority,
      report.assignedTo,
      report.assignedDepartment,
      report.createdAt,
      report.resolvedAt || '',
      `"${report.location.replace(/"/g, '""')}"`,
      report.rating || '',
      `"${(report.feedback || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  // Export to PDF
  async exportToPDF(data: ReportExportData[], filename: string): Promise<void> {
    // For PDF export, we'll create a simple HTML table and print it
    // You can integrate with a proper PDF library like jsPDF or pdfmake
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .summary { background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reports Export</h1>
            <div>Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="summary">
            <strong>Summary:</strong> ${data.length} reports exported
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Department</th>
                <th>Created Date</th>
                <th>Location</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(report => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.title}</td>
                  <td>${report.category}</td>
                  <td>${report.status}</td>
                  <td>${report.priority}</td>
                  <td>${report.assignedTo}</td>
                  <td>${report.assignedDepartment}</td>
                  <td>${report.createdAt}</td>
                  <td>${report.location}</td>
                  <td>${report.rating || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    this.downloadFile(blob, `${filename}.html`);

    // Note: For proper PDF generation, you might want to use a library like:
    // window.print() for the current HTML, or integrate with a PDF service
    console.log('Open the downloaded HTML file and use "Print as PDF" for best results');
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();