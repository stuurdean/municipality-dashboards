import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { CreateUserDTO, UserType } from '@/types/user';

export const authService = {
  // Register new user with email and password
  async registerUser(userData: CreateUserDTO & { password: string }) {
    try {
      console.log('🔐 Creating user with email:', userData.email);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      console.log('✅ Firebase Auth user created:', userCredential.user.uid);

      // Create user document in Firestore
      const userDoc = {
        email: userData.email,
        fullName: userData.fullName,
        userType: userData.userType,
        municipalityId: userData.municipalityId,
        phoneNumber: userData.phoneNumber || '',
        department: userData.department || '',
        skills: userData.skills || [],
        isActive: true,
        currentWorkload: 0,
        maxWorkload: userData.maxWorkload || 5,
        createdAt: serverTimestamp(),
        lastLoginAt: null,
        profilePictureUrl: '',
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
      console.log('✅ Firestore user document created');

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: userData.fullName
      });

      console.log('✅ User profile updated');

      return {
        uid: userCredential.user.uid,
        ...userDoc
      };
    } catch (error: any) {
      console.error('❌ Error registering user:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('The email address is not valid.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password accounts are not enabled.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('The password is too weak.');
      } else {
        throw new Error('Failed to create user account. Please try again.');
      }
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No user found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('The email address is not valid.');
      } else {
        throw new Error('Failed to send password reset email. Please try again.');
      }
    }
  },

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  },

  // Send welcome email (you can integrate with your email service)
  async sendWelcomeEmail(email: string, fullName: string, temporaryPassword?: string) {
    // This is a placeholder - integrate with your email service (SendGrid, AWS SES, etc.)
    console.log('📧 Welcome email would be sent to:', email);
    console.log('👋 Welcome', fullName);
    if (temporaryPassword) {
      console.log('🔑 Temporary password:', temporaryPassword);
    }
    
    // Example implementation:
    /*
    const emailData = {
      to: email,
      subject: 'Welcome to Municipality Dashboard',
      html: `
        <h1>Welcome, ${fullName}!</h1>
        <p>Your account has been created successfully.</p>
        ${temporaryPassword ? `<p>Your temporary password: <strong>${temporaryPassword}</strong></p>` : ''}
        <p>Please login at: https://your-municipality-dashboard.com</p>
      `
    };
    await yourEmailService.send(emailData);
    */
  }
};