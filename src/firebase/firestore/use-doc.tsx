'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import * as mockData from '@/lib/data';
import { useFirestore } from '@/firebase/provider';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 * If Firestore is not available, it will return mock data based on the document path.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDocRef or BAD THINGS WILL HAPPEN
 * use useMemoFirebase to memoize it per React guidence.  Also make sure that it's dependencies are stable references
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  const firestore = useFirestore();
  
  useEffect(() => {
    // If Firebase is not available or ref is null, use mock data
    if (!firestore || !memoizedDocRef) {
        setIsLoading(true);
        const pathSegments = memoizedDocRef?.path.split('/');
        const collection = pathSegments?.[0];
        const docId = pathSegments?.[1];

        let mockResult: any = null;
        if (collection && docId) {
            const mockCollection = (mockData as any)[collection];
            if (mockCollection && Array.isArray(mockCollection)) {
                mockResult = mockCollection.find(item => item.id === docId) || null;
            }
        } else if (collection === 'users' && docId === 'mock-user-id') { // Special case for mock user profile
             mockResult = {
                id: 'mock-user-id',
                displayName: 'Admin User',
                email: 'admin@axushire.com',
                role: 'root',
                companyIds: [],
                isGlobalAdmin: true,
                canManageAllCompanies: true,
            };
        }
        
        // Simulate async fetching
        setTimeout(() => {
            setData(mockResult as StateDataType);
            setIsLoading(false);
        }, 500);

        return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef, firestore]);

  return { data, isLoading, error };
}
