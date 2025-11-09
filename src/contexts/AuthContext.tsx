'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AuthContextType, User } from '@/types/auth';
import { auth, db } from '@/lib/firebase/config';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<void> => { // Change return type to void
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User account not found');
    }

    const userData = userDoc.data();
    
    // 🔒 ONLY ALLOW ADMIN AND EMPLOYEE
    if (userData.userType !== 'ADMIN' && userData.userType !== 'EMPLOYEE') {
      await signOut(auth);
      throw new Error('Access restricted to municipal staff only');
    }

    const userObj: User = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      userType: userData.userType,
      municipalityId: userData.municipalityId,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      createdAt: userData.createdAt,
    };

    // Update last login
    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLoginAt: new Date()
    });

    setUser(userObj);
    // Don't return anything (void)
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // 🔒 CHECK USER TYPE ON AUTH STATE CHANGE
            if (userData.userType !== 'ADMIN' && userData.userType !== 'EMPLOYEE') {
              await signOut(auth);
              setUser(null);
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                userType: userData.userType,
                municipalityId: userData.municipalityId,
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber,
                createdAt: userData.createdAt,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};