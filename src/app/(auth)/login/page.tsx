'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserProfile } from '@/lib/data';
import { useTranslation } from '@/app/(app)/layout';

function AuthForm({
  isRegister = false,
  isLoading,
  onSubmit,
}: {
  isRegister?: boolean;
  isLoading: boolean;
  onSubmit: (email: string, pass: string) => Promise<void>;
}) {
  const [email, setEmail] = useState(isRegister ? '' : 'system@kognisync.com');
  const [password, setPassword] = useState(isRegister ? '' : 'password123');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={isRegister ? 'register-email' : 'login-email'}>{t('login.email')}</Label>
        <Input
          id={isRegister ? 'register-email' : 'login-email'}
          type="email"
          placeholder={isRegister ? 'tu@correo.com' : 'system@kognisync.com'}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={isRegister ? 'register-password' : 'login-password'}>{t('login.password')}</Label>
        <div className="relative">
            <Input
              id={isRegister ? 'register-password' : 'login-password'}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                <span className="sr-only">{showPassword ? t('layout.passwordDialog.hidePassword') : t('layout.passwordDialog.showPassword')}</span>
            </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (isRegister ? t('login.registering') : t('login.loggingIn')) : (isRegister ? t('login.registerButton') : t('login.loginButton'))}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { t } = useTranslation();

  const handleLogin = async (email: string, password: string) => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: t('login.toast.loginSuccess'),
        description: t('login.toast.loginSuccessDescription'),
      });
      // onAuthStateChanged in the layout will handle the redirect
    } catch (error: any) {
      console.error("Login Error:", error);
      let description = t('login.toast.loginErrorDescription');
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          description = t('login.toast.loginErrorDescription');
      } else if (error.code === 'auth/too-many-requests') {
        description = t('login.toast.loginErrorTooMany');
      }
      toast({
        variant: 'destructive',
        title: t('login.toast.loginError'),
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const nameFromEmail = email.split('@')[0];
        await updateProfile(user, {
            displayName: nameFromEmail
        });

        // Create user profile document in Firestore
        const userRef = doc(firestore, 'users', user.uid);

        const newUserProfile: Omit<UserProfile, 'id'> = {
            email: user.email!,
            displayName: nameFromEmail,
            role: 'Candidato', // Default role for new sign-ups
            companyIds: [],
        };
        
        await setDocumentNonBlocking(userRef, newUserProfile, { merge: true });

        toast({
            title: t('login.toast.registerSuccess'),
            description: t('login.toast.registerSuccessDescription'),
        });
        // onAuthStateChanged will handle the redirect
    } catch (error: any) {
        console.error("Creation Error:", error);
        let description = t('login.toast.registerErrorDescription');
        if (error.code === 'auth/email-already-in-use') {
            description = t('login.toast.registerErrorEmailInUse');
        } else if (error.code === 'auth/weak-password') {
            description = t('login.toast.registerErrorWeakPassword');
        }
        toast({
            variant: 'destructive',
            title: t('login.toast.registerError'),
            description: description,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Logo className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="font-headline text-3xl font-bold">AxusHire</CardTitle>
            <CardDescription>
              {activeTab === 'login' ? t('login.title') : t('login.titleRegister')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t('login.tabs.login')}</TabsTrigger>
                    <TabsTrigger value="register">{t('login.tabs.register')}</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="pt-4">
                    <AuthForm isLoading={isLoading} onSubmit={handleLogin} />
                </TabsContent>
                <TabsContent value="register" className="pt-4">
                    <AuthForm isRegister isLoading={isLoading} onSubmit={handleRegister} />
                </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex-col gap-2 justify-center text-center text-xs text-muted-foreground">
             <p dangerouslySetInnerHTML={{ __html: t('login.rootHint')}} />
              <Link href="/empleos" className="text-primary hover:underline">
                {t('login.publicHint')}
              </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
