import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface Employee {
  id: string;
  email: string;
  fullName: string;
  userType: 'EMPLOYEE' | 'ADMIN';
  department?: string;
  phoneNumber?: string;
  isActive: boolean;
  skills?: string[];
  currentWorkload: number;
  maxWorkload: number;
  createdAt: Date;
  lastActiveAt?: Date;
}

export const employeeService = {
  // Get all active employees
  async getActiveEmployees(): Promise<Employee[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('userType', '==', 'EMPLOYEE'),
        where('isActive', '==', true),
        orderBy('fullName', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const employees: Employee[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          email: data.email,
          fullName: data.fullName,
          userType: data.userType,
          department: data.department,
          phoneNumber: data.phoneNumber,
          isActive: data.isActive !== false,
          skills: data.skills || [],
          currentWorkload: data.currentWorkload || 0,
          maxWorkload: data.maxWorkload || 5,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActiveAt: data.lastActiveAt?.toDate(),
        });
      });

      return employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get employees by department
  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('userType', '==', 'EMPLOYEE'),
        where('isActive', '==', true),
        where('department', '==', department),
        orderBy('fullName', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const employees: Employee[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          email: data.email,
          fullName: data.fullName,
          userType: data.userType,
          department: data.department,
          phoneNumber: data.phoneNumber,
          isActive: data.isActive !== false,
          skills: data.skills || [],
          currentWorkload: data.currentWorkload || 0,
          maxWorkload: data.maxWorkload || 5,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActiveAt: data.lastActiveAt?.toDate(),
        });
      });

      return employees;
    } catch (error) {
      console.error('Error fetching employees by department:', error);
      throw error;
    }
  },

  // Get employee by ID
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const employees = await this.getActiveEmployees();
      return employees.find(emp => emp.id === id) || null;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }
};