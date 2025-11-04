'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

// Helper to check if Firestore is available
const isFirestoreAvailable = (docRef: DocumentReference | CollectionReference): boolean => {
    return !!docRef.firestore;
};

/**
 * Initiates a setDoc operation for a document reference.
 * In mock mode, it logs the action to the console.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  if (!isFirestoreAvailable(docRef)) {
      console.log(`[MOCK] Firestore: Setting document in ${docRef.path}`, { data, options });
      return;
  }

  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    )
  })
}


/**
 * Initiates an addDoc operation for a collection reference.
 * In mock mode, it logs the action to the console.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  if (!isFirestoreAvailable(colRef)) {
      console.log(`[MOCK] Firestore: Adding document to ${colRef.path}`, { data });
      // In mock mode, we can't return a real DocRef promise, so we return a resolved promise of null.
      return Promise.resolve(null);
  }
  
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * In mock mode, it logs the action to the console.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  if (!isFirestoreAvailable(docRef)) {
      console.log(`[MOCK] Firestore: Updating document in ${docRef.path}`, { data });
      return;
  }

  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * In mock mode, it logs the action to the console.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  if (!isFirestoreAvailable(docRef)) {
      console.log(`[MOCK] Firestore: Deleting document from ${docRef.path}`);
      return;
  }

  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
