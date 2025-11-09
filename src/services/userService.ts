import { 
  collection, 
  getDocs, 
  getDoc, 
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, CreateUserDTO, UpdateUserDTO, UserStats, UserType, USER_DEPARTMENTS, USER_SKILLS } from '@/types/user';

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push(this.firestoreToUser(doc));
      });

      return users;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  },

  // Get users by type
  async getUsersByType(userType: UserType): Promise<User[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('userType', '==', userType),
        orderBy('fullName', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push(this.firestoreToUser(doc));
      });

      return users;
    } catch (error) {
      console.error('❌ Error fetching users by type:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.firestoreToUser(docSnap);
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw error;
    }
  },

  // Create new user


  // Update user
  async updateUser(id: string, updateData: UpdateUserDTO): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  },

  // Delete user (soft delete)
  async deleteUser(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  },

  // Activate user
  async activateUser(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        isActive: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error activating user:', error);
      throw error;
    }
  },

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getAllUsers();
      
      const stats: UserStats = {
        total: users.length,
        byType: {
          ADMIN: users.filter(u => u.userType === 'ADMIN').length,
          EMPLOYEE: users.filter(u => u.userType === 'EMPLOYEE').length,
          RESIDENT: users.filter(u => u.userType === 'RESIDENT').length,
        },
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length,
      };

      return stats;
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      throw error;
    }
  },

  // Search users
  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const users = await this.getAllUsers();
      
      return users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm)
      );
    } catch (error) {
      console.error('❌ Error searching users:', error);
      throw error;
    }
  },

  // Convert Firestore document to User object
     firestoreToUser(doc: any): User {
    const data = doc.data();
    
    return {
      id: doc.id,
      email: data.email,
      fullName: data.fullName,
      userType: data.userType,
      municipalityId: data.municipalityId,
      phoneNumber: data.phoneNumber,
      department: data.department,
      isActive: data.isActive !== false,
      skills: data.skills || [],
      currentWorkload: data.currentWorkload || 0,
      maxWorkload: data.maxWorkload || 5,
      profilePictureUrl: data.profilePictureUrl,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate(),
      assignedReports: data.assignedReports || [],
    };
  },

  // Utility methods
  getDepartments(): typeof USER_DEPARTMENTS {
    return USER_DEPARTMENTS;
  },

  getSkills(): typeof USER_SKILLS {
    return USER_SKILLS;
  },

  getUserTypeColor(userType: UserType): string {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      EMPLOYEE: 'bg-blue-100 text-blue-800',
      RESIDENT: 'bg-green-100 text-green-800'
    };
    return colors[userType];
  },

  getUserTypeIcon(userType: UserType): string {
    const icons = {
      ADMIN: '👑',
      EMPLOYEE: '👷',
      RESIDENT: '👤'
    };
    return icons[userType];
  }
};