
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FirebaseClientProvider, useUser } from "@/firebase";
import { Loader2 } from 'lucide-react';

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait for user status to be confirmed
    }
    if (user) {
      // If user is already logged in, redirect them away from auth pages
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // While checking auth state or if user is logged in (and about to be redirected)
  // show a loading screen.
  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not loading and no user, show the auth page content (e.g., Login form)
  return <>{children}</>;
}


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </FirebaseClientProvider>
  );
}
