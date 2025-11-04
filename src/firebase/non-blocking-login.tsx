'use client';
import {
  Auth, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth | null): void {
  if (!authInstance) {
    console.warn("Auth service not available, skipping anonymous sign-in.");
    return;
  }
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth | null, email: string, password: string): void {
  if (!authInstance) {
    console.warn("Auth service not available, skipping email sign-up.");
    return;
  }
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth | null, email: string, password: string): void {
  if (!authInstance) {
    console.warn("Auth service not available, skipping email sign-in.");
    return;
  }
  signInWithEmailAndPassword(authInstance, email, password);
}
