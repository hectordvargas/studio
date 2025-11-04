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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={isRegister ? 'register-email' : 'login-email'}>Correo Electrónico</Label>
        <Input
          id={isRegister ? 'register-email' : 'login-email'}
          type="email"
          placeholder={isRegister ? 'tu@correo.com' : 'system@axushire.com'}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={isRegister ? 'register-password' : 'login-password'}>Contraseña</Label>
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
                <span className="sr-only">{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
            </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (isRegister ? 'Registrando...' : 'Accediendo...') : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}
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

  const handleLogin = async (email: string, password: string) => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: '¡Bienvenido de nuevo!',
      });
      // onAuthStateChanged in the layout will handle the redirect
    } catch (error: any) {
      console.error("Login Error:", error);
      let description = 'Ocurrió un error inesperado.';
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          description = 'El correo o la contraseña son incorrectos.'
      } else if (error.code === 'auth/too-many-requests') {
        description = 'Demasiados intentos fallidos. Intenta de nuevo más tarde.';
      }
      toast({
        variant: 'destructive',
        title: 'Fallo en el Inicio de Sesión',
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

        // In a real app, a Cloud Function would listen to user creation
        // and set the appropriate custom claims (e.g., for 'root' or 'Superadmin' based on email).
        // For this demo, the claim is not set on the client.
        
        await setDocumentNonBlocking(userRef, newUserProfile, { merge: true });

        toast({
            title: 'Cuenta Creada y Sesión Iniciada',
            description: '¡Bienvenido! Se ha creado una nueva cuenta para ti.',
        });
        // onAuthStateChanged will handle the redirect
    } catch (error: any) {
        console.error("Creation Error:", error);
        let description = 'No se pudo crear la cuenta.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'Este correo electrónico ya está en uso. Intenta iniciar sesión.'
        } else if (error.code === 'auth/weak-password') {
            description = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.'
        }
        toast({
            variant: 'destructive',
            title: 'Fallo en la Creación de Cuenta',
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
              {activeTab === 'login' ? 'Inicia sesión para acceder a tu panel de control.' : 'Crea una cuenta para empezar a gestionar talento.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                    <TabsTrigger value="register">Registrarse</TabsTrigger>
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
             <p>Usa el correo <code className="font-code mx-1 rounded bg-muted p-1">system@axushire.com</code> y la contraseña <code className="font-code mx-1 rounded bg-muted p-1">password123</code> para acceder como Root.</p>
              <Link href="/empleos" className="text-primary hover:underline">
                O ver las plazas públicas
              </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

    
