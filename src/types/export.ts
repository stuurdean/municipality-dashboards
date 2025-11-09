// types/export.ts
export interface ExportFilter {
  status?: string;
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  category?: string;
  department?: string;
}

export interface ExportOptions {
  format: 'excel' | 'pdf';
  includeImages: boolean;
  includeComments: boolean;
}

export interface ReportExportData {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  assignedTo: string;
  assignedDepartment: string;
  createdAt: string;
  resolvedAt?: string;
  location: string;
  rating?: number;
  feedback?: string;
}