import { User } from '@/types/auth';
import { auth } from './config';

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user as User | null);
    }, reject);
  });
};