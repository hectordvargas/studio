'use client'

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Home, Briefcase, Users, Settings, LogOut, KeyRound, Eye, EyeOff, Building2, Globe, ChevronsUpDown, Check, ClipboardList, Archive, Loader2, Languages } from "lucide-react";
import { Logo } from "@/components/icons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo, createContext, useContext, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Company } from "@/lib/data";
import { cn } from "@/lib/utils";
import { FirebaseClientProvider, useUser, useAuth, useDoc, useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, updateDoc } from 'firebase/firestore';
import { updatePassword } from "firebase/auth";

import es from '@/lib/locales/es.json';
import en from '@/lib/locales/en.json';

type Language = 'es' | 'en';

const translations = { es, en };

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};


function PasswordChangeDialog({ open, onOpenChange, user, onPasswordChanged }: { open: boolean, onOpenChange: (open: boolean) => void, user: any, onPasswordChanged: () => void }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Las contraseñas no coinciden.' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await updatePassword(user, newPassword);
            onPasswordChanged();
            toast({
                title: "Contraseña Actualizada",
                description: "Tu contraseña ha sido actualizada exitosamente.",
            });
            onOpenChange(false);
        } catch (error: any) {
            let description = 'Ocurrió un error inesperado.';
            if (error.code === 'auth/weak-password') {
                description = 'La contraseña es demasiado débil.';
            } else if (error.code === 'auth/requires-recent-login') {
                description = 'Esta operación requiere un inicio de sesión reciente. Por favor, cierra sesión y vuelve a iniciarla.';
            }
            toast({
                variant: "destructive",
                title: "Error al actualizar la contraseña",
                description: description,
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };
    
    useEffect(() => {
        if (!open) {
          setNewPassword('');
          setConfirmPassword('');
          setShowPassword(false);
          setShowConfirmPassword(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onInteractOutside={(e) => e.preventDefault()} showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{t('layout.forcePasswordDialog.title')}</DialogTitle>
                    <DialogDescription>
                       {t('layout.forcePasswordDialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="force-new-password">{t('layout.passwordDialog.newPassword')}</Label>
                        <div className="relative">
                            <Input id="force-new-password" type={showPassword ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isUpdatingPassword}/>
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="force-confirm-password">{t('layout.passwordDialog.confirmPassword')}</Label>
                        <div className="relative">
                            <Input id="force-confirm-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isUpdatingPassword}/>
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                            {isUpdatingPassword && <Loader2 className="mr-2 animate-spin" />}
                             {t('layout.forcePasswordDialog.saveAndContinue')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const { t } = useTranslation();
  const firestore = useFirestore();
  
  const { user, isUserLoading } = useUser();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
  
  const companiesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'companies');
  }, [firestore]);

  const { data: companies, isLoading: isLoadingCompanies } = useCollection<Company>(companiesRef);


  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [showForcePasswordChange, setShowForcePasswordChange] = useState(false);
  
  useEffect(() => {
    if (userProfile && userProfile.requiresPasswordChange) {
      setShowForcePasswordChange(true);
    } else {
      setShowForcePasswordChange(false);
    }
  }, [userProfile]);

  const handlePasswordHasBeenChanged = async () => {
    if (userProfileRef) {
        try {
            await updateDoc(userProfileRef, { requiresPasswordChange: false });
        } catch (error) {
            console.error("Error updating password change status:", error);
        }
    }
  }
  
  const managedCompanies = useMemo(() => {
    if (!userProfile || !companies) return [];
    if (userProfile.isGlobalAdmin || userProfile.canManageAllCompanies) {
        return companies;
    }
    return companies.filter(c => userProfile.companyIds?.includes(c.id));
  }, [userProfile, companies]);

  useEffect(() => {
    if (isLoadingCompanies || managedCompanies.length === 0 || selectedCompany) {
      return;
    }
  
    const currentCompanyFromPath = managedCompanies.find(c => pathname.includes(`/companies/${c.id}`));
    
    if (currentCompanyFromPath) {
      setSelectedCompany(currentCompanyFromPath);
    } else {
      setSelectedCompany(managedCompanies[0]);
    }
  }, [isLoadingCompanies, managedCompanies, selectedCompany, pathname]);

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is determined
    }

    if (!user && !pathname.startsWith('/empleos') && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [isUserLoading, user, router, pathname]);

  const handleLogout = async () => {
    try {
      if (auth) {
        await auth.signOut();
        toast({
          title: t('layout.toast.logoutSuccess'),
          description: t('layout.toast.logoutSuccessDescription'),
        });
        // The useEffect above will handle the redirection to /login
      }
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        variant: "destructive",
        title: t('layout.toast.logoutError'),
        description: t('layout.toast.logoutErrorDescription'),
      });
    }
  };


  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCompanySwitcherOpen(false);
    router.push(`/companies/${company.id}`);
  };

  const navItems = [
    { href: "/dashboard", label: t('layout.nav.dashboard'), icon: Home, roles: ['root', 'Superadmin', 'Tech/Soporte', 'Distribuidor', 'Administrador', 'Supervisor', 'Reclutador', 'Entrevistador', 'Lector'] },
    { href: "/jobs", label: t('layout.nav.jobs'), icon: Briefcase, roles: ['root', 'Superadmin', 'Distribuidor', 'Administrador', 'Supervisor', 'Reclutador'] },
    { href: "/candidates", label: t('layout.nav.candidates'), icon: Users, roles: ['root', 'Superadmin', 'Distribuidor', 'Administrador', 'Supervisor', 'Reclutador'] },
    { href: "/applications", label: t('layout.nav.applications'), icon: Archive, roles: ['root', 'Superadmin', 'Distribuidor', 'Administrador', 'Supervisor', 'Reclutador'] },
    { href: "/companies", label: t('layout.nav.companies'), icon: Building2, roles: ['root', 'Superadmin', 'Distribuidor', 'Administrador'] },
    { href: "/evaluations", label: t('layout.nav.evaluations'), icon: ClipboardList, roles: ['root', 'Superadmin', 'Administrador', 'Supervisor'] },
    { href: "/empleos", label: t('layout.nav.publicView'), icon: Globe, roles: ['root', 'Superadmin', 'Tech/Soporte', 'Distribuidor', 'Administrador', 'Supervisor', 'Reclutador', 'Entrevistador', 'Lector'] },
    { href: "/settings", label: t('layout.nav.settings'), icon: Settings, roles: ['root', 'Superadmin'] },
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para cambiar tu contraseña.' });
        return;
    }
    if (newPassword !== confirmPassword) {
        toast({ variant: 'destructive', title: 'Error', description: t('layout.toast.passwordUpdateErrorMatch') });
        return;
    }
    if (newPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Error', description: t('layout.toast.passwordUpdateErrorLength') });
        return;
    }

    setIsUpdatingPassword(true);
    try {
        await updatePassword(user, newPassword);
        toast({
            title: t('layout.toast.passwordUpdateSuccess'),
            description: t('layout.toast.passwordUpdateSuccessDescription'),
        });
        setOpen(false);
        setNewPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        console.error("Password update error:", error);
        let description = t('layout.toast.passwordUpdateErrorUnexpected');
        if (error.code === 'auth/weak-password') {
            description = t('layout.toast.passwordUpdateErrorWeak');
        } else if (error.code === 'auth/requires-recent-login') {
            description = t('layout.toast.passwordUpdateErrorReauth');
        }
        toast({
            variant: "destructive",
            title: t('layout.toast.passwordUpdateError'),
            description: description,
        });
    } finally {
        setIsUpdatingPassword(false);
    }
  }
  
  useEffect(() => {
    if (!open) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  const { language, setLanguage } = useLanguage();

  if (isUserLoading || isLoadingProfile || (!user && !pathname.startsWith('/empleos') && !pathname.startsWith('/login'))) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const canSeeCompanySwitcher = userProfile && ['root', 'Superadmin', 'Distribuidor'].includes(userProfile.role) && managedCompanies.length > 1;

  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="size-7 text-primary" />
              <span className="text-lg font-semibold">AxusHire</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                userProfile && item.roles.includes(userProfile.role) && (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} target={item.href === '/empleos' ? '_blank' : '_self'}>
                      <SidebarMenuButton isActive={pathname.startsWith(item.href) && item.href !== '/empleos'}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Dialog open={open} onOpenChange={setOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                    <Avatar className="size-8">
                      <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/admin/100/100"} data-ai-hint="person portrait"/>
                      <AvatarFallback>{userProfile?.displayName?.substring(0,2) || user?.email?.substring(0,2) || 'HV'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium truncate">{userProfile?.displayName || user?.email}</p>
                      {userProfile?.role && <p className="text-xs text-muted-foreground">{userProfile.role}</p>}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{userProfile?.displayName || 'Sin Nombre'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>{t('layout.userMenu.updatePassword')}</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('layout.userMenu.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>{t('layout.passwordDialog.title')}</DialogTitle>
                      <DialogDescription>
                         {t('layout.passwordDialog.description')}
                      </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="new-password">{t('layout.passwordDialog.newPassword')}</Label>
                          <div className="relative">
                              <Input id="new-password" type={showPassword ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isUpdatingPassword}/>
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
                      <div className="space-y-2">
                          <Label htmlFor="confirm-password">{t('layout.passwordDialog.confirmPassword')}</Label>
                          <div className="relative">
                              <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isUpdatingPassword}/>
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute inset-y-0 right-0 h-full px-3"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                  <span className="sr-only">{showConfirmPassword ? t('layout.passwordDialog.hidePassword') : t('layout.passwordDialog.showPassword')}</span>
                              </Button>
                          </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost" disabled={isUpdatingPassword}>{t('layout.passwordDialog.cancel')}</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isUpdatingPassword}>
                            {isUpdatingPassword && <Loader2 className="mr-2 animate-spin" />}
                            {isUpdatingPassword ? t('layout.passwordDialog.saving') : t('layout.passwordDialog.save')}
                        </Button>
                      </DialogFooter>
                  </form>
              </DialogContent>
            </Dialog>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            
            <div className="flex items-center gap-2">
              {canSeeCompanySwitcher && (
                <Dialog open={companySwitcherOpen} onOpenChange={setCompanySwitcherOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={companySwitcherOpen}
                            className="w-[220px] justify-between"
                            disabled={isLoadingCompanies || !managedCompanies.length}
                        >
                            {isLoadingCompanies ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            ) : (
                            <div className="flex items-center gap-2">
                              
                                {selectedCompany ? (
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={selectedCompany.logo} alt={selectedCompany.name} />
                                        <AvatarFallback>{selectedCompany.name.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <Building2 className="h-5 w-5" />
                                )}
                                <span className="truncate">{selectedCompany ? selectedCompany.name : t('layout.companySwitcher.selectCompany')}</span>
                            </div>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 max-w-sm">
                        <DialogHeader className="p-4 pb-0">
                            <DialogTitle>{t('layout.companySwitcher.title')}</DialogTitle>
                            <DialogDescription>
                                {t('layout.companySwitcher.description')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-4 space-y-2">
                            {managedCompanies.map((company) => (
                                <Button
                                    key={company.id}
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start text-base",
                                        selectedCompany?.id === company.id && "font-bold"
                                    )}
                                    onClick={() => handleCompanySelect(company)}
                                >
                                    <Avatar className="mr-3 h-7 w-7 border">
                                        <AvatarImage src={company.logo} />
                                        <AvatarFallback>{company.name.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    {company.name}
                                    <Check
                                        className={cn(
                                            "ml-auto h-5 w-5",
                                            selectedCompany?.id === company.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
              )}

              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                          <Languages className="h-5 w-5" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('layout.languageSwitcher.label')}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setLanguage('es')} className={language === 'es' ? 'font-bold' : ''}>
                          {t('layout.languageSwitcher.es')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setLanguage('en')} className={language === 'en' ? 'font-bold' : ''}>
                          {t('layout.languageSwitcher.en')}
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1">
              {/* Breadcrumbs or search can go here */}
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
         {user && <PasswordChangeDialog open={showForcePasswordChange} onOpenChange={setShowForcePasswordChange} user={user} onPasswordChanged={handlePasswordHasBeenChanged} />}
      </SidebarProvider>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  }, [language]);
  
  return (
    <FirebaseClientProvider>
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </LanguageContext.Provider>
    </FirebaseClientProvider>
  );
}
