import { 
  collection, 
  getDocs, 
  getDoc, 
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Report, UpdateReportDTO, CreateReportDTO, REPORT_STATUS, PRIORITY } from '@/types/reports';
import { employeeService } from './employeeService';

// Comment interface
export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  userEmail: string;
  userType: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Status History interface
export interface StatusHistory {
  id: string;
  reportId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedByUser: string;
  notes: string;
  timestamp: Date;
  automatic: boolean;
}

export const reportService = {
  // Get all reports
  async getAllReports(): Promise<Report[]> {
    try {
      console.log('📡 Fetching all reports from Firestore...');
      
      const q = query(
        collection(db, 'reports'), 
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports: Report[] = [];
      
      querySnapshot.forEach((doc) => {
        reports.push(this.firestoreToReport(doc));
      });

      return reports;
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      throw error;
    }
  },

  // Get report by ID
  async getReportById(id: string): Promise<Report | null> {
    try {
      const docRef = doc(db, 'reports', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.firestoreToReport(docSnap);
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching report:', error);
      throw error;
    }
  },


  // Update report
  async updateReport(id: string, updateData: UpdateReportDTO): Promise<void> {
    try {
      const docRef = doc(db, 'reports', id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating report:', error);
      throw error;
    }
  },

  // Update report status with history tracking
  async updateReportStatus(
    id: string, 
    newStatus: string, 
    user: { uid: string; email: string; userType: string },
    notes: string = ''
  ): Promise<void> {
    try {
      const report = await this.getReportById(id);
      if (!report) throw new Error('Report not found');

      // Update report status
      const docRef = doc(db, 'reports', id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Add to status history
      await this.addStatusHistory(id, {
        oldStatus: report.status,
        newStatus,
        changedBy: user.uid,
        changedByUser: user.email,
        notes,
        automatic: false
      });

    } catch (error) {
      console.error('❌ Error updating report status:', error);
      throw error;
    }
  },

  // Add comment to report
  async addComment(
    reportId: string, 
    commentData: { 
      userId: string; 
      userEmail: string; 
      userType: string;
      content: string; 
    }
  ): Promise<Comment> {
    try {
      const commentWithTimestamp = {
        ...commentData,
        reportId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, 'reports', reportId, 'comments'), 
        commentWithTimestamp
      );

      // Update report's updatedAt timestamp
      await updateDoc(doc(db, 'reports', reportId), {
        updatedAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...commentWithTimestamp,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  },

  // Get comments for a report
  async getComments(reportId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, 'reports', reportId, 'comments'),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const comments: Comment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          reportId: data.reportId,
          userId: data.userId,
          userEmail: data.userEmail,
          userType: data.userType,
          content: data.content,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return comments;
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      throw error;
    }
  },

  // Get status history for a report
  async getStatusHistory(reportId: string): Promise<StatusHistory[]> {
    try {
      const q = query(
        collection(db, 'reports', reportId, 'statusHistory'),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const history: StatusHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          reportId: data.reportId,
          oldStatus: data.oldStatus,
          newStatus: data.newStatus,
          changedBy: data.changedBy,
          changedByUser: data.changedByUser,
          notes: data.notes,
          timestamp: data.timestamp?.toDate() || new Date(),
          automatic: data.automatic || false,
        });
      });

      return history;
    } catch (error) {
      console.error('❌ Error fetching status history:', error);
      throw error;
    }
  },

  // Private method to add status history
 async addStatusHistory(
    reportId: string, 
    historyData: Omit<StatusHistory, 'id' | 'reportId' | 'timestamp'>
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'reports', reportId, 'statusHistory'), {
        ...historyData,
        reportId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error adding status history:', error);
      throw error;
    }
  },

  // Convert Firestore document to Report object
   firestoreToReport(doc: any): Report {
    const data = doc.data();
    
    return {
      id: doc.id,
      userId: data.userId || '',
      municipalityId: data.municipalityId || '',
      title: data.title || 'Untitled Report',
      description: data.description || '',
      issueType: data.issueType || 'OTHER',
      imageURLs: data.imageURLs || [],
      location: data.location || { latitude: 0, longitude: 0 },
      address: data.address || '',
      aiConfidenceScore: data.aiConfidenceScore || 0,
      aiSuggestedType: data.aiSuggestedType,
      aiClassificationCompleted: data.aiClassificationCompleted || false,
      status: data.status || 'submitted',
      priority: data.priority || 'medium',
      previousPriority: data.previousPriority,
      priorityAutoApplied: data.priorityAutoApplied || false,
      priorityAppliedReason: data.priorityAppliedReason,
      assignedTo: data.assignedTo,
      assignedAt: data.assignedAt?.toDate?.(),
      mlProcessingStatus: data.mlProcessingStatus || 'pending',
      mlProcessingCompletedAt: data.mlProcessingCompletedAt?.toDate?.(),
      mlConfidenceScore: data.mlConfidenceScore || 0,
      mlSuggestions: data.mlSuggestions || [],
      imageClassifications: data.imageClassifications || [],
      textAnalysis: data.textAnalysis,
      issueTypeAutoApplied: data.issueTypeAutoApplied || false,
      issueTypeAppliedReason: data.issueTypeAppliedReason,
      previousIssueType: data.previousIssueType,
      mlProcessingError: data.mlProcessingError,
      processingError: data.processingError,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      resolvedAt: data.resolvedAt?.toDate?.(),
    };
  },

  // Add to reportService object
async assignReport(
  reportId: string, 
  employeeId: string, 
  assignedBy: { uid: string; email: string; userType: string },
  notes: string = ''
): Promise<void> {
  try {
    const employee = await employeeService.getEmployeeById(employeeId);
    if (!employee) throw new Error('Employee not found');

    const docRef = doc(db, 'reports', reportId);
    await updateDoc(docRef, {
      assignedTo: employee.fullName,
      assignedToId: employeeId,
      assignedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Add to status history
    await this.addStatusHistory(reportId, {
      oldStatus: '',
      newStatus: 'assigned',
      changedBy: assignedBy.uid,
      changedByUser: assignedBy.email,
      notes: `Assigned to ${employee.fullName}${notes ? `: ${notes}` : ''}`,
      automatic: false
    });

    // Add comment about assignment
    await this.addComment(reportId, {
      userId: assignedBy.uid,
      userEmail: assignedBy.email,
      userType: assignedBy.userType,
      content: `📋 Report assigned to ${employee.fullName}${notes ? `\n\n**Notes:** ${notes}` : ''}`
    });

  } catch (error) {
    console.error('❌ Error assigning report:', error);
    throw error;
  }
},

async unassignReport(
  reportId: string,
  unassignedBy: { uid: string; email: string; userType: string }
): Promise<void> {
  try {
    const docRef = doc(db, 'reports', reportId);
    await updateDoc(docRef, {
      assignedTo: null,
      assignedToId: null,
      assignedAt: null,
      updatedAt: serverTimestamp()
    });

    // Add to status history
    await this.addStatusHistory(reportId, {
      oldStatus: 'assigned',
      newStatus: 'unassigned',
      changedBy: unassignedBy.uid,
      changedByUser: unassignedBy.email,
      notes: 'Report unassigned',
      automatic: false
    });

    // Add comment about unassignment
    await this.addComment(reportId, {
      userId: unassignedBy.uid,
      userEmail: unassignedBy.email,
      userType: unassignedBy.userType,
      content: '📋 Report unassigned from previous employee'
    });

  } catch (error) {
    console.error('❌ Error unassigning report:', error);
    throw error;
  }
},

};