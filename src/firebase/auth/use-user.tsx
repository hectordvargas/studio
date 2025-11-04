'use client';

import { useContext, useEffect, useState } from 'react';
import { FirebaseContext, UserHookResult } from '@/firebase/provider';
import type { User } from 'firebase/auth';

const mockUser = {
  uid: 'mock-user-id',
  email: 'admin@axushire.com',
  displayName: 'Admin User',
  photoURL: 'https://picsum.photos/seed/admin/100/100',
  // Add other properties as needed to match the User type
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({ token: 'mock-token', claims: {}, authTime: '', expirationTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null }),
  reload: async () => {},
  toJSON: () => ({}),
} as unknown as User;


/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * In mock mode, it returns a predefined admin user.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }

  // If Firebase services are not available, run in mock mode.
  if (!context.areServicesAvailable) {
    const [mockUserResult, setMockUserResult] = useState<UserHookResult>({
      user: null,
      isUserLoading: true,
      userError: null
    });

    useEffect(() => {
      // Simulate a short delay to mimic async user loading
      const timer = setTimeout(() => {
        setMockUserResult({
          user: mockUser,
          isUserLoading: false,
          userError: null,
        });
      }, 500);

      return () => clearTimeout(timer);
    }, []);
    
    return mockUserResult;
  }
  
  // If services are available, use the real user from context.
  return { user: context.user, isUserLoading: context.isUserLoading, userError: context.userError };
};
