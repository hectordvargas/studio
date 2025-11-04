
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
import { useTranslation } from '@/app/layout';

function AuthForm({
  isRegister = false,
  isLoading,
  onSubmit,
}: {
  isRegister?: boolean;
  isLoading: boolean;
  onSubmit: (email: string, pass: string, name?: string) => Promise<void>;
}) {
  const [email, setEmail] = useState(isRegister ? '' : 'system@kognisync.com');
  const [password, setPassword] = useState(isRegister ? '' : 'password123');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, isRegister ? name : undefined);
  };
  
  const buttonText = () => {
      if (isLoading) {
          return isRegister ? t('login.registering') : t('login.loggingIn');
      }
      if(isRegister){
          return t('login.registerButton');
      }
      // Special case for root user creation
      if(email === 'system@kognisync.com' && !isRegister) {
          return "Crear Usuario Root";
      }
      return t('login.loginButton');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister && (
         <div className="space-y-2">
            <Label htmlFor="register-name">Nombre</Label>
            <Input
              id="register-name"
              type="text"
              placeholder="Tu Nombre"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={isRegister ? 'register-email' : 'login-email'}>{t('login.email')}</Label>
        <Input
          id={isRegister ? 'register-email' : 'login-email'}
          type="email"
          placeholder={isRegister ? 'tu@correo.com' : 'system@kognisync.com'}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || (email === 'system@kognisync.com' && !isRegister)}
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
        {buttonText()}
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

  const handleAuthAction = async (email: string, password: string, name?: string) => {
    if (!auth || !firestore) return;
    setIsLoading(true);

    try {
        if (activeTab === 'register' && name) { // Registering a new candidate
             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });

            const newUserProfile: Omit<UserProfile, 'id'> = {
                email: user.email!, displayName: name, role: 'Candidato', companyIds: [],
            };
            
            await setDocumentNonBlocking(doc(firestore, 'users', user.uid), newUserProfile, { merge: true });

            toast({ title: t('login.toast.registerSuccess'), description: t('login.toast.registerSuccessDescription') });

        } else if (email === 'system@kognisync.com') { // Creating root user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const displayName = "System Root";
            await updateProfile(user, { displayName });

            const newUserProfile: Omit<UserProfile, 'id'> = {
                email: user.email!, displayName, role: 'root', companyIds: [], isGlobalAdmin: true, canManageAllCompanies: true, requiresPasswordChange: false,
            };

            await setDocumentNonBlocking(doc(firestore, 'users', user.uid), newUserProfile, { merge: true });
            
            toast({ title: "Usuario Root Creado", description: "Inicia sesión con las nuevas credenciales." });
             setActiveTab('login'); // Switch back to login view after creation

        } else { // Standard login
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: t('login.toast.loginSuccess'), description: t('login.toast.loginSuccessDescription') });
        }
    } catch (error: any) {
        console.error("Auth Error:", error);
        let title = "Error";
        let description = "Ha ocurrido un error.";

        if (activeTab === 'register') {
            title = t('login.toast.registerError');
            if (error.code === 'auth/email-already-in-use') {
              description = "Este correo ya está en uso. Intenta iniciar sesión o crear el usuario Root si es el caso.";
            } else if (error.code === 'auth/weak-password') {
              description = t('login.toast.registerErrorWeakPassword');
            } else {
              description = t('login.toast.registerErrorDescription');
            }
        } else {
            title = t('login.toast.loginError');
             if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                description = 'Usuario no encontrado. Si eres el administrador, usa el botón "Crear Usuario Root".';
            } else if (error.code === 'auth/wrong-password') {
                description = t('login.toast.loginErrorDescription');
            } else if (error.code === 'auth/too-many-requests') {
                description = t('login.toast.loginErrorTooMany');
            }
        }
        toast({ variant: 'destructive', title, description });
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
            <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t('login.tabs.login')}</TabsTrigger>
                    <TabsTrigger value="register">{t('login.tabs.register')}</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="pt-4">
                    <AuthForm isLoading={isLoading} onSubmit={handleAuthAction} />
                </TabsContent>
                <TabsContent value="register" className="pt-4">
                    <AuthForm isRegister isLoading={isLoading} onSubmit={handleAuthAction} />
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
