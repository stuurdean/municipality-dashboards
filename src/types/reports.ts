/**
 * 📋 Type Definitions for Report System - TypeScript Version
 */

// Firebase Timestamp type
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}

// Firestore FieldValue for server timestamps
export interface FieldValue {
  // This is a marker interface for Firestore server timestamps
}

// Report Status Enum
export enum REPORT_STATUS {
  SUBMITTED = 'submitted',
  AI_PROCESSED = 'ai_processed',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REJECTED = 'rejected',
  VERIFICATION_NEEDED = 'verification_needed',
  ASSIGNED = "ASSIGNED"
}

// Priority Levels Enum
export enum PRIORITY {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Issue Types Enum
export enum ISSUE_TYPES {
  POTHOLE = 'pothole',
  WATER_LEAK = 'water_leak',
  GARBAGE = 'garbage',
  STREET_LIGHT = 'street_light',
  TRAFFIC_SIGNAL = 'traffic_signal',
  DRAINAGE = 'drainage',
  VEGETATION = 'vegetation',
  OTHER = 'other'
}

// Notification Types Enum
export enum NOTIFICATION_TYPES {
  AI_PROCESSING_COMPLETE = 'ai_processing_complete',
  PRIORITY_UPDATED = 'priority_updated',
  STATUS_UPDATED = 'status_updated',
  STAFF_ALERT = 'staff_alert'
}

/**
 * 🔧 Core Interfaces
 */

// Location Interface
export interface Location {
  latitude: number;
  longitude: number;
  geohash?: string;
}

// Image Classification Prediction
export interface ImagePrediction {
  label: string;
  confidence: number;
}

// Image Classification Result
export interface ImageClassification {
  imageURL: string;
  imageIndex: number;
  label: string;
  confidence: number;
  modelVersion: string;
  processingTime: number;
  timestamp: string | Timestamp;
  allPredictions: ImagePrediction[];
  fallback?: boolean;
  error?: string;
}

// Sentiment Analysis Result
export interface SentimentAnalysis {
  score: number;
  magnitude: number;
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number;
  source: string;
  fallback?: boolean;
  sentences?: Array<{
    text: string;
    score: number;
    magnitude: number;
  }>;
}

// Entity Extraction Result
export interface TextEntity {
  text?: string;
  name?: string;
  type: string;
  confidence: number;
  description?: string;
}

export interface EntityExtraction {
  locations: TextEntity[];
  objects: TextEntity[];
  issues: TextEntity[];
  dates: TextEntity[];
  fallback: boolean;
}

// Priority Factors
export interface PriorityFactors {
  sentiment: number;
  urgencyKeywords: number;
  safetyKeywords: number;
  categoryRisk: number;
  textLength: number;
}

// Priority Suggestion
export interface PrioritySuggestion {
  priority: PRIORITY;
  score: number;
  confidence: number;
  factors: PriorityFactors;
  reasoning: string;
}

// Category Suggestion
export interface CategorySuggestion {
  label: ISSUE_TYPES;
  confidence: number;
  matchingKeywords: string[];
}

// Text Analysis Results
export interface TextAnalysis {
  sentiment: SentimentAnalysis;
  categorySuggestion?: CategorySuggestion;
  prioritySuggestion?: PrioritySuggestion;
  keywords: string[];
  entities: EntityExtraction;
  confidence: number;
}

// ML Suggestion Types
export type MLSuggestionType = 'ISSUE_TYPE_CORRECTION' | 'PRIORITY_ADJUSTMENT';

// ML Suggestion
export interface MLSuggestion {
  type: MLSuggestionType;
  field: string;
  current: any;
  suggested: any;
  confidence: number;
  reason: string;
  source: string;
}

// Priority Change Information
export interface PriorityChange {
  from: PRIORITY;
  to: PRIORITY;
  confidence: number;
  reason: string;
  source: string;
}

// Category Change Information
export interface CategoryChange {
  current: ISSUE_TYPES | string;
  suggested: ISSUE_TYPES;
  confidence: number;
  reason: string;
  source: string;
}

// Image Insights
export interface ImageInsights {
  primarySuggestion: {
    label: ISSUE_TYPES;
    confidence: number;
    consensus: number;
    supportingImages: number;
  };
  allClassifications: ImageClassification[];
  confidence: number;
  processedCount: number;
}

// AI Processing Results
export interface AIProcessingResults {
  confidenceScore: number;
  finalSuggestions: MLSuggestion[];
  priorityChange?: PriorityChange;
  categoryChange?: CategoryChange;
  imageInsights?: ImageInsights;
  textInsights?: TextAnalysis;
  originalIssueType?: string;
  originalPriority?: PRIORITY;
  processingTime: string;
}

// Status History Entry
export interface StatusHistory {
  id: string;
  reportId: string;
  oldStatus: REPORT_STATUS | string;
  newStatus: REPORT_STATUS | string;
  changedBy: string;
  changedByUser: string;
  notes: string;
  timestamp: Timestamp | FieldValue;
  automatic: boolean;
  mlProcessing?: boolean;
  aiProcessing?: boolean;
  priorityUpdate?: boolean;
  processingResults?: {
    confidence: number;
    suggestionsApplied: number;
    totalSuggestions: number;
    processingTime: string;
  };
  aiResults?: {
    confidence: number;
    priorityChange?: PriorityChange;
    categoryChange?: CategoryChange;
    suggestions?: MLSuggestion[];
  };
  priorityChange?: {
    from: PRIORITY;
    to: PRIORITY;
    reason: string;
  };
  mlSuggestion?: MLSuggestion;
}

// Notification Entry
export interface Notification {
  id: string;
  reportId: string;
  userId: string;
  type: NOTIFICATION_TYPES | string;
  messageId: string;
  timestamp: Timestamp | FieldValue;
  read: boolean;
  data?: {
    [key: string]: any;
  };
}

// ML Processing Status
export type MLProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * 📊 Main Report Interface
 */
export interface Report {
  // Basic Information
  id: string;
  userId: string;
  municipalityId: string;
  
  // Report Content
  title: string;
  description: string;
  issueType: ISSUE_TYPES | string;
  
  // Media
  imageURLs: string[];
  
  // Location
  location: Location;
  address: string;
  
  // AI Processing Results
  aiConfidenceScore: number;
  aiSuggestedType?: ISSUE_TYPES | string;
  aiClassificationCompleted: boolean;
  
  // Status & Priority
  status: REPORT_STATUS | string;
  priority: PRIORITY | string;
  previousPriority?: PRIORITY | string;
  priorityAutoApplied?: boolean;
  priorityAppliedReason?: string;
  
  // Assignment
  assignedTo?: string;
  assignedAt?: Timestamp | FieldValue;
  
  // ML Processing Metadata
  mlProcessingStatus: MLProcessingStatus;
  mlProcessingCompletedAt?: Timestamp | FieldValue;
  mlConfidenceScore: number;
  mlSuggestions: MLSuggestion[];
  
  // Detailed ML Insights
  imageClassifications?: ImageClassification[];
  textAnalysis?: TextAnalysis;
  
  // Auto-application tracking
  issueTypeAutoApplied?: boolean;
  issueTypeAppliedReason?: string;
  previousIssueType?: ISSUE_TYPES | string;
  
  // Error Handling
  mlProcessingError?: string;
  processingError?: string;
  
  // Timestamps
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  resolvedAt?: Timestamp | FieldValue;
}

/**
 * 📝 Report Creation DTO (Data Transfer Object)
 */
export interface CreateReportDTO {
  userId: string;
  municipalityId: string;
  title: string;
  description: string;
  issueType: ISSUE_TYPES | string;
  imageURLs: string[];
  location: Location;
  address: string;
}

/**
 * 🔄 Report Update DTO
 */
export interface UpdateReportDTO {
  title?: string;
  description?: string;
  issueType?: ISSUE_TYPES | string;
  status?: REPORT_STATUS | string;
  priority?: PRIORITY | string;
  assignedTo?: string;
  imageURLs?: string[];
  address?: string;
}

/**
 * 📈 Report Statistics
 */
export interface ReportStats {
  total: number;
  byStatus: {
    [status in REPORT_STATUS]?: number;
  };
  byPriority: {
    [priority in PRIORITY]?: number;
  };
  byIssueType: {
    [issueType in ISSUE_TYPES]?: number;
  };
  aiProcessed: number;
  avgProcessingTime: number;
}

/**
 * 🔍 Report Filter Options
 */
export interface ReportFilters {
  status?: REPORT_STATUS | string;
  priority?: PRIORITY | string;
  issueType?: ISSUE_TYPES | string;
  dateRange?: {
    start: Date | Timestamp;
    end: Date | Timestamp;
  };
  userId?: string;
  municipalityId?: string;
  assignedTo?: string;
  hasImages?: boolean;
  aiProcessed?: boolean;
}

/**
 * 📄 Report Search Results
 */
export interface ReportSearchResults {
  reports: Report[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: ReportFilters;
}

/**
 * 🎯 Utility Functions
 */

// Type guards
export const isReportStatus = (status: string): status is REPORT_STATUS => {
  return Object.values(REPORT_STATUS).includes(status as REPORT_STATUS);
};

export const isPriority = (priority: string): priority is PRIORITY => {
  return Object.values(PRIORITY).includes(priority as PRIORITY);
};

export const isIssueType = (issueType: string): issueType is ISSUE_TYPES => {
  return Object.values(ISSUE_TYPES).includes(issueType as ISSUE_TYPES);
};

// Validation functions
export const validateReport = (report: Partial<Report>): string[] => {
  const errors: string[] = [];

  if (!report.userId) errors.push('User ID is required');
  if (!report.municipalityId) errors.push('Municipality ID is required');
  if (!report.title || report.title.trim().length === 0) errors.push('Title is required');
  if (!report.issueType) errors.push('Issue type is required');
  if (!report.location) errors.push('Location is required');
  if (report.location && (typeof report.location.latitude !== 'number' || typeof report.location.longitude !== 'number')) {
    errors.push('Valid location coordinates are required');
  }

  return errors;
};

// Helper functions
export const getPriorityColor = (priority: PRIORITY | string): string => {
  switch (priority) {
    case PRIORITY.CRITICAL: return '#FF0000';
    case PRIORITY.HIGH: return '#FF9800';
    case PRIORITY.MEDIUM: return '#2196F3';
    case PRIORITY.LOW: return '#4CAF50';
    default: return '#757575';
  }
};

export const getStatusColor = (status: REPORT_STATUS | string): string => {
  switch (status) {
    case REPORT_STATUS.SUBMITTED: return '#FFA000';
    case REPORT_STATUS.AI_PROCESSED: return '#2196F3';
    case REPORT_STATUS.UNDER_REVIEW: return '#FF9800';
    case REPORT_STATUS.IN_PROGRESS: return '#9C27B0';
    case REPORT_STATUS.RESOLVED: return '#4CAF50';
    case REPORT_STATUS.CLOSED: return '#757575';
    case REPORT_STATUS.REJECTED: return '#F44336';
    default: return '#757575';
  }
};

export const formatPriority = (priority: PRIORITY | string): string => {
  switch (priority) {
    case PRIORITY.CRITICAL: return '🚨 Critical';
    case PRIORITY.HIGH: return '⚠️ High';
    case PRIORITY.MEDIUM: return '🔶 Medium';
    case PRIORITY.LOW: return '✅ Low';
    default: return priority;
  }
};

export const formatStatus = (status: REPORT_STATUS | string): string => {
  switch (status) {
    case REPORT_STATUS.SUBMITTED: return 'Submitted';
    case REPORT_STATUS.AI_PROCESSED: return 'AI Processed';
    case REPORT_STATUS.UNDER_REVIEW: return 'Under Review';
    case REPORT_STATUS.IN_PROGRESS: return 'In Progress';
    case REPORT_STATUS.RESOLVED: return 'Resolved';
    case REPORT_STATUS.CLOSED: return 'Closed';
    case REPORT_STATUS.REJECTED: return 'Rejected';
    default: return status;
  }
};

export const formatIssueType = (issueType: ISSUE_TYPES | string): string => {
  switch (issueType) {
    case ISSUE_TYPES.POTHOLE: return '🕳️ Pothole';
    case ISSUE_TYPES.WATER_LEAK: return '💧 Water Leak';
    case ISSUE_TYPES.GARBAGE: return '🗑️ Garbage';
    case ISSUE_TYPES.STREET_LIGHT: return '💡 Street Light';
    case ISSUE_TYPES.TRAFFIC_SIGNAL: return '🚦 Traffic Signal';
    case ISSUE_TYPES.DRAINAGE: return '🌊 Drainage';
    case ISSUE_TYPES.VEGETATION: return '🌿 Vegetation';
    case ISSUE_TYPES.OTHER: return '📋 Other';
    default: return issueType;
  }
};

// Default values
export const createDefaultReport = (createData: CreateReportDTO): Partial<Report> => {
  return {
    ...createData,
    status: REPORT_STATUS.SUBMITTED,
    priority: PRIORITY.MEDIUM,
    aiConfidenceScore: 0,
    aiClassificationCompleted: false,
    mlProcessingStatus: 'pending',
    mlConfidenceScore: 0,
    mlSuggestions: [],
    imageClassifications: [],
    createdAt: { } as FieldValue, // Will be set by Firestore
    updatedAt: { } as FieldValue, // Will be set by Firestore
  };
};

// Export all types
export default {
  // Enums
  REPORT_STATUS,
  PRIORITY,
  ISSUE_TYPES,
  NOTIFICATION_TYPES,
  
  // Interfaces
  Location,
  Notification,
  Report,
  isReportStatus,
  isPriority,
  isIssueType,
  validateReport,
  getPriorityColor,
  getStatusColor,
  formatPriority,
  formatStatus,
  formatIssueType,
  createDefaultReport,
};