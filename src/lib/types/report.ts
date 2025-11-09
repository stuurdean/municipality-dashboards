export interface Report {
  id: string;
  userId: string;
  municipalityId: string;
  issueType: IssueType;
  title: string;
  description: string;
  imageURLs: string[];
  location: GeoPoint;
  address: string;
  aiConfidenceScore: number;
  status: ReportStatus;
  priority: PriorityLevel;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export type IssueType = 
  | 'pothole' 
  | 'water_leak' 
  | 'sewer_blockage' 
  | 'garbage' 
  | 'streetlight';

export type ReportStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'assigned' 
  | 'in_progress' 
  | 'resolved' 
  | 'rejected';

export type PriorityLevel = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}