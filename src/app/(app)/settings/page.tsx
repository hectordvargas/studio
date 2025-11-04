

'use client';

import React, { useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, PlusCircle, Trash2, Send, KeyRound, Eye, EyeOff, Video, Loader2, Check, DatabaseZap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth, useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, setDoc, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { UserProfile, Company } from "@/lib/data";
import Link from "next/link";


const defaultRoles = [
  {
    name: 'root',
    description: 'Control total del sistema. El único que puede gestionar Superadministradores.',
    permissions: [
        { id: 'permRoot', label: 'Acceso y control total sobre toda la base de datos' },
        { id: 'permRoot2', label: 'Puede nombrar y eliminar Superadministradores' },
    ],
  },
  {
    name: 'Superadmin',
    description: 'Administrador global del portal.',
    permissions: [
      { id: 'perm1', label: 'Gestionar todas las empresas' },
      { id: 'perm2', label: 'Gestionar todos los usuarios (excepto root y otros Superadmins)' },
      { id: 'perm3', label: 'Acceso total a todas las configuraciones' },
    ],
  },
  {
    name: 'Tech/Soporte',
    description: 'Acceso técnico para mantenimiento y soporte.',
    permissions: [
        { id: 'permTech1', label: 'Acceso de solo lectura a configuraciones' },
        { id: 'permTech2', label: 'Puede diagnosticar problemas técnicos' },
    ],
  },
  {
    name: 'Distribuidor',
    description: 'Gestiona la creación y asignación de empresas.',
    permissions: [
        { id: 'permDist1', label: 'Crear nuevos perfiles de empresa' },
        { id: 'permDist2', label: 'Asignar administradores a empresas' },
    ],
  },
  {
    name: 'Administrador',
    description: 'Se crea por cada perfil de empresa y tiene acceso a toda la configuración de su empresa.',
    permissions: [
      { id: 'perm4', label: 'Gestionar perfil de su empresa' },
      { id: 'perm5', label: 'Gestionar usuarios y roles de su empresa' },
      { id: 'perm6', label: 'Ver todos los datos de su empresa' },
    ],
  },
  {
    name: 'Supervisor',
    description: 'Gestiona plazas, candidatos y reclutadores para su empresa.',
    permissions: [
      { id: 'perm7', label: 'Crear y gestionar plazas' },
      { id: 'perm8', label: 'Asignar reclutadores a plazas' },
      { id: 'perm9', label: 'Ver todos los candidatos de la empresa' },
    ],
  },
  {
    name: 'Reclutador',
    description: 'Solo tiene visibilidad sobre las plazas que se le asignen.',
    permissions: [
      { id: 'perm10', label: 'Ver plazas asignadas' },
      { id: 'perm11', label: 'Gestionar candidatos de plazas asignadas' },
    ],
  },
  {
    name: 'Entrevistador',
    description: 'Solo puede ver las plazas y candidatos asignados, sin poder realizar modificaciones.',
    permissions: [
        { id: 'perm14', label: 'Ver plazas asignadas' },
        { id: 'perm15', label: 'Ver candidatos de plazas asignadas' },
        { id: 'perm16', label: 'No puede modificar ni gestionar candidatos' },
    ],
  },
   {
    name: 'Lector',
    description: 'Rol de solo lectura sobre la información de la empresa.',
    permissions: [
        { id: 'permLector1', label: 'Ver todas las plazas de la empresa' },
        { id: 'permLector2', label: 'Ver todos los candidatos de la empresa' },
    ],
  },
  {
    name: 'Candidato',
    description: 'Gestiona su propio perfil y aplicaciones.',
    permissions: [
      { id: 'perm12', label: 'Actualizar su perfil personal' },
      { id: 'perm13', label: 'Ver estado de sus aplicaciones' },
    ],
  },
];

const availableRoles: UserProfile['role'][] = [
    'Administrador', 'Supervisor', 'Reclutador', 'Entrevistador', 'Lector'
];

function CreateUserDialog({ onUserCreated }: { onUserCreated: (newUser: UserProfile) => void }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [displayName, setDisplayName] = React.useState('');
    const [role, setRole] = React.useState<UserProfile['role'] | ''>('');
    const [showPassword, setShowPassword] = React.useState(false);
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth || !firestore) return;
        if (!email || !password || !displayName || !role) {
            toast({ variant: 'destructive', title: "Error", description: "Todos los campos son obligatorios." });
            return;
        }
        setIsLoading(true);
        try {
            // This only creates the user in Firebase Auth.
            // A separate backend process (like a Cloud Function) would be needed to set custom claims.
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const newUserProfile: Omit<UserProfile, 'id'> = {
                displayName,
                email,
                role,
                companyIds: [],
                requiresPasswordChange: true,
                isGlobalAdmin: role === 'root' || role === 'Superadmin',
                canManageAllCompanies: role === 'root' || role === 'Superadmin',
            };

            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, newUserProfile, { merge: true });

            onUserCreated({ ...newUserProfile, id: user.uid });
            
            toast({ 
                title: "Usuario Creado", 
                description: "El nuevo usuario ha sido creado. La asignación de rol (Custom Claim) requiere un proceso de backend." 
            });
            setIsOpen(false);
            // Reset form
            setEmail('');
            setPassword('');
            setDisplayName('');
            setRole('');
        } catch (error: any) {
            console.error("Error creating user:", error);
            let description = 'Ocurrió un error al crear el usuario.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'Este correo electrónico ya está en uso.';
            } else if (error.code === 'auth/weak-password') {
                description = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
            }
            toast({ variant: 'destructive', title: "Error", description });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Crear Usuario
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario del Sistema</DialogTitle>
                    <DialogDescription>
                        Completa los datos para añadir un nuevo miembro al sistema. Podrás asignarlo a empresas después de crearlo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Nombre Completo <span className="text-destructive">*</span></Label>
                        <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico <span className="text-destructive">*</span></Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Contraseña Temporal <span className="text-destructive">*</span></Label>
                         <div className="relative">
                            <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">El usuario deberá cambiarla en su primer inicio de sesión.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol Inicial <span className="text-destructive">*</span></Label>
                        <Select onValueChange={(value: UserProfile['role']) => setRole(value)} value={role}>
                            <SelectTrigger><SelectValue placeholder="Selecciona un rol"/></SelectTrigger>
                            <SelectContent>
                                {defaultRoles.filter(r => r.name !== 'Candidato').map(r => (
                                    <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost" disabled={isLoading}>Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 animate-spin" />}
                            {isLoading ? 'Creando...' : 'Crear Usuario'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


const defaultFooterContent = `© ${new Date().getFullYear()} Altiaweb Ltd. All rights reserved.
71-75, Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
Company Nr: 14174666 | VAT Registration Nr: 473 3229 90 | ICO Registration Nr: ZB506149
+44 20 3838-0707 | support@altiaweb.co.uk`;

function EditUserDialog({ user, currentUserRole, onUserUpdate, allCompanies }: { user: UserProfile, currentUserRole?: UserProfile['role'], onUserUpdate: (updatedUser: UserProfile) => void, allCompanies: Company[] | null }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    
    const [formData, setFormData] = React.useState<Partial<UserProfile>>({});

    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    
    const canEdit = currentUserRole === 'root' || (currentUserRole === 'Superadmin' && user.role !== 'root');
    const canChangeRole = currentUserRole === 'root' || (currentUserRole === 'Superadmin' && user.role !== 'root' && user.role !== 'Superadmin');
    
    const isCompanyRole = formData.role && !['root', 'Superadmin', 'Candidato', 'Tech/Soporte', 'Distribuidor'].includes(formData.role);

    const handleFormChange = (field: keyof UserProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveGeneral = async () => {
        if (!canEdit || !firestore) return;
        setIsSaving(true);
        
        const updatedUserData = {
            ...formData,
            isGlobalAdmin: formData.role === 'root' || formData.role === 'Superadmin',
        };

        const userRef = doc(firestore, 'users', user.id);
        
        try {
            await setDoc(userRef, updatedUserData, { merge: true });
            onUserUpdate({ ...user, ...updatedUserData});
            toast({ title: "Usuario Actualizado", description: `Los datos de ${user.displayName} han sido actualizados.` });
            setIsOpen(false);
        } catch (error) {
            console.error("Error saving user:", error);
            toast({ variant: 'destructive', title: "Error", description: "No se pudieron guardar los cambios." });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSetTemporaryPassword = async () => {
        if (!canEdit || password.length < 6) {
             toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        setIsSaving(true);

        const userRef = doc(firestore, 'users', user.id);
        try {
            // This is a placeholder. A real implementation would require a backend function
            // to update the password as you cannot directly set a password for another user on the client.
            await setDoc(userRef, { requiresPasswordChange: true }, { merge: true });
            onUserUpdate({ ...user, ...formData, requiresPasswordChange: true });
            toast({ title: "Contraseña Temporal Establecida", description: `El usuario deberá cambiarla en su próximo inicio de sesión.` });
            setPassword('');
        } catch (error) {
            console.error("Error setting temporary password:", error);
            toast({ variant: 'destructive', title: "Error", description: "No se pudo establecer la contraseña temporal." });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSetFixedPassword = async () => {
        if (!canEdit || password.length < 6) {
            toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        setIsSaving(true);
        
        const userRef = doc(firestore, 'users', user.id);
        try {
             // This is a placeholder for the same reasons as above.
            await setDoc(userRef, { requiresPasswordChange: false }, { merge: true });
            onUserUpdate({ ...user, ...formData, requiresPasswordChange: false });
            toast({ title: "Contraseña Fija Establecida", description: `Se ha establecido una nueva contraseña para el usuario.` });
            setPassword('');
        } catch (error) {
             console.error("Error setting fixed password:", error);
            toast({ variant: 'destructive', title: "Error", description: "No se pudo establecer la contraseña." });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSendPasswordReset = async () => {
        if (!auth || !user.email) return;
        setIsSaving(true);
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast({ title: "Correo Enviado", description: `Se han enviado las instrucciones para restablecer la contraseña a ${user.email}.` });
        } catch (error) {
            console.error("Error sending password reset:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el correo de restablecimiento." });
        } finally {
            setIsSaving(false);
        }
    };
    
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                displayName: user.displayName || '',
                email: user.email,
                role: user.role,
                companyIds: user.companyIds || [],
                canManageAllCompanies: user.canManageAllCompanies || false,
            });
            setPassword('');
        }
    }, [isOpen, user]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0" disabled={!canEdit}>
                     <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Editar Usuario: {user.displayName || user.email}</DialogTitle>
                </DialogHeader>
                 <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="gestion">Gestion</TabsTrigger>
                        <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Nombre</Label>
                            <Input id="displayName" value={formData.displayName || ''} onChange={(e) => handleFormChange('displayName', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" value={user.email} disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select value={formData.role} onValueChange={(value) => handleFormChange('role', value as UserProfile['role'])} disabled={!canChangeRole || user.role === 'root'}>
                                <SelectTrigger id="role"><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                                <SelectContent>
                                    {defaultRoles.map(r => (
                                    (currentUserRole === 'root' || r.name !== 'root') && <SelectItem key={r.name} value={r.name} disabled={r.name === 'root' || (currentUserRole !== 'root' && r.name === 'Superadmin')}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!canChangeRole && <p className="text-xs text-muted-foreground">No tienes permisos para cambiar el rol de este usuario.</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="gestion" className="pt-4 space-y-4">
                         {isCompanyRole ? (
                            <div className="space-y-4 rounded-md border p-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id={`manage-all-${user.id}`} checked={formData.canManageAllCompanies} onCheckedChange={(checked) => handleFormChange('canManageAllCompanies', !!checked)} />
                                    <Label htmlFor={`manage-all-${user.id}`} className="font-normal">Puede administrar todas las empresas</Label>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <Label className={formData.canManageAllCompanies ? 'text-muted-foreground' : ''}>Empresas Asignadas Específicas</Label>
                                    <div className={`max-h-24 overflow-y-auto space-y-3 pr-2 ${formData.canManageAllCompanies ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {allCompanies?.map((company) => (
                                            <div key={company.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`company-${user.id}-${company.id}`}
                                                    checked={formData.companyIds?.includes(company.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentIds = formData.companyIds || [];
                                                        const newIds = checked ? [...currentIds, company.id] : currentIds.filter(id => id !== company.id);
                                                        handleFormChange('companyIds', newIds);
                                                    }}
                                                    disabled={formData.canManageAllCompanies}
                                                />
                                                <Label htmlFor={`company-${user.id}-${company.id}`} className="font-normal flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 border"><AvatarImage src={company.logo} /><AvatarFallback>{company.name.substring(0, 1)}</AvatarFallback></Avatar>
                                                    {company.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>La gestión de empresas no aplica a roles globales como 'root' o 'Superadmin', ni a 'Candidato'.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="seguridad" className="pt-4 space-y-6">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">Contraseña Temporal</CardTitle>
                                <CardDescription>El usuario deberá cambiarla en su próximo inicio de sesión.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <Input id="temp-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña temporal"/>
                                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </Button>
                                </div>
                                <Button onClick={handleSetTemporaryPassword} disabled={isSaving || !password} className="w-full">
                                    {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                                    <KeyRound className="mr-2"/>
                                    Forzar Cambio de Contraseña
                                </Button>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="pb-4">
                                <CardTitle className="text-base">Establecer Contraseña Fija</CardTitle>
                                <CardDescription>Define una contraseña permanente para el usuario. No se forzará un cambio.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="relative">
                                    <Input id="fixed-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña fija"/>
                                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </Button>
                                </div>
                                <Button onClick={handleSetFixedPassword} disabled={isSaving || !password} className="w-full">
                                    {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                                    <Check className="mr-2"/>
                                    Establecer Contraseña Fija
                                </Button>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">Recuperación de Cuenta</CardTitle>
                                <CardDescription>Envía un correo con instrucciones para que el usuario restablezca su contraseña.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" onClick={handleSendPasswordReset} disabled={isSaving} className="w-full">
                                    {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                                    <Send className="mr-2"/>
                                    Enviar Correo de Recuperación
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" disabled={isSaving}>Cancelar</Button></DialogClose>
                    <Button onClick={handleSaveGeneral} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function UserManagementTab({ userProfile }: { userProfile: UserProfile | null }) {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || !userProfile) return null;
        if (userProfile.role === 'Administrador') {
            return query(collection(firestore, 'users'), where('companyIds', 'array-contains-any', userProfile.companyIds || []));
        }
        return collection(firestore, 'users');
    }, [firestore, userProfile]);

    const { data: allUsers, isLoading: isLoadingUsers, setData: setAllUsers } = useCollection<UserProfile>(usersQuery);

    const companiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'companies') : null, [firestore]);
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<Company>(companiesQuery);

    const canManageUsers = userProfile && ['root', 'Superadmin', 'Administrador'].includes(userProfile.role);
    const canCreateUsers = userProfile && ['root', 'Superadmin'].includes(userProfile.role);

    const handleUserUpdate = (updatedUser: UserProfile) => {
        if (!allUsers) return;
        const userIndex = allUsers.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            const newUsers = [...allUsers];
            newUsers[userIndex] = updatedUser;
            setAllUsers(newUsers);
        }
    };

    const handleUserCreated = (newUser: UserProfile) => {
        if (allUsers) {
            setAllUsers([...allUsers, newUser]);
        } else {
            setAllUsers([newUser]);
        }
    };
    
    const getDisplayedCompanies = (user: UserProfile) => {
        if (user.isGlobalAdmin || user.canManageAllCompanies) {
            return [<Badge key="all" variant="outline">Todas</Badge>];
        }
        if (!user.companyIds || user.companyIds.length === 0) {
            return <span className="text-xs text-muted-foreground">Ninguna</span>;
        }
        const userCompanies = companies?.filter(c => user.companyIds?.includes(c.id));
        if (userCompanies && userCompanies.length > 0) {
            return userCompanies.map(c => <Badge key={c.id} variant="outline">{c.name}</Badge>);
        }
        return <span className="text-xs text-muted-foreground">Cargando...</span>;
    };

    if (!canManageUsers) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>La gestión de usuarios y roles está restringida a los Administradores y roles superiores.</p>
                        <p className="text-sm mt-2">No tienes los permisos necesarios para ver esta sección.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>
                        Visualiza y gestiona los roles y accesos de los usuarios del sistema.
                    </CardDescription>
                </div>
                {canCreateUsers && <CreateUserDialog onUserCreated={handleUserCreated} />}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Empresas Asignadas</TableHead>
                            <TableHead><span className="sr-only">Acciones</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingUsers || isLoadingCompanies ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    <Loader2 className="mx-auto animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            allUsers?.sort((a, b) => {
                                const roleOrder: { [key: string]: number } = { 'root': 0, 'Superadmin': 1 };
                                const roleA = roleOrder[a.role] ?? 2;
                                const roleB = roleOrder[b.role] ?? 2;
                                if (roleA !== roleB) return roleA - roleB;
                                return (a.displayName || a.email).localeCompare(b.displayName || b.email);
                            }).map((user) => {
                                return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{user.displayName?.substring(0, 2) || user.email.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.displayName || 'Sin Nombre'}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant={user.role === 'root' ? "destructive" : (user.role === 'Superadmin' ? 'default' : 'secondary')}>{user.role}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {getDisplayedCompanies(user)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditUserDialog user={user} currentUserRole={userProfile?.role} onUserUpdate={handleUserUpdate} allCompanies={companies} />
                                    </TableCell>
                                </TableRow>
                            )})
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export default function SettingsPage() {
    const { toast } = useToast();
    const [footerContent, setFooterContent] = React.useState(defaultFooterContent);
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
    
    const handleSaveFooter = () => {
        toast({
            title: "Pie de Página Actualizado",
            description: "El contenido del pie de página público ha sido guardado.",
        });
    };
    
    const canSeePublicPortalTab = userProfile && ['root', 'Superadmin'].includes(userProfile.role);
    const canSeeIntegrationsTab = userProfile && ['root', 'Superadmin'].includes(userProfile.role);


    if(isLoadingProfile) {
        return <div className="flex h-full w-full justify-center items-center"><Loader2 className="animate-spin" /></div>
    }

    return (
        <>
            <DashboardHeader
                title="Ajustes"
                description="Gestiona tu cuenta y la configuración de la aplicación."
            />
            <Tabs defaultValue="user-management">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="user-management">Usuarios</TabsTrigger>
                    <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
                    {canSeePublicPortalTab && <TabsTrigger value="public-portal">Portal Público</TabsTrigger>}
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                    {canSeeIntegrationsTab && <TabsTrigger value="integrations">Integraciones</TabsTrigger>}
                </TabsList>
                <TabsContent value="user-management">
                    <UserManagementTab userProfile={userProfile} />
                </TabsContent>
                <TabsContent value="roles">
                     <Card>
                        <CardHeader>
                            <CardTitle>Roles y Permisos</CardTitle>
                            <CardDescription>
                                Define lo que cada rol puede ver y hacer en la aplicación.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {defaultRoles.map(role => (
                                    <AccordionItem key={role.name} value={role.name}>
                                        <AccordionTrigger>{role.name}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="mb-4 text-sm text-muted-foreground">{role.description}</p>
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium">Permisos</h4>
                                                <div className="grid gap-2">
                                                    {role.permissions.map(perm => (
                                                        <div key={perm.id} className="flex items-center gap-2">
                                                            <Checkbox id={perm.id} defaultChecked disabled/>
                                                            <Label htmlFor={perm.id} className="font-normal">{perm.label}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button size="sm" className="mt-4" disabled>Guardar Cambios</Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                {canSeePublicPortalTab && (
                 <TabsContent value="public-portal">
                    <Card>
                        <CardHeader>
                            <CardTitle>Portal Público</CardTitle>
                            <CardDescription>
                                Personaliza el pie de página que se muestra en las páginas públicas de empleo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="footer-content">Contenido del Pie de Página</Label>
                                <Textarea
                                    id="footer-content"
                                    rows={8}
                                    value={footerContent}
                                    onChange={(e) => setFooterContent(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Este contenido aparecerá en la parte inferior de todas las páginas de tu portal de empleo público.
                                </p>
                            </div>
                            <Button onClick={handleSaveFooter}>Guardar Cambios</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                )}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notificaciones</CardTitle>
                            <CardDescription>
                                Gestiona cómo recibes las notificaciones.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Nuevos Candidatos</h3>
                                    <p className="text-sm text-muted-foreground">Recibir un correo electrónico cuando un nuevo candidato aplique a una plaza.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                             <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Cambios de Estado</h3>
                                    <p className="text-sm text-muted-foreground">Recibir notificaciones cuando el estado de un candidato cambie.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <h3 className="font-medium">Resumen Semanal</h3>
                                    <p className="text-sm text-muted-foreground">Obtener un resumen semanal de la actividad de reclutamiento.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {canSeeIntegrationsTab && (
                <TabsContent value="integrations">
                    <Card>
                         <CardHeader>
                            <CardTitle>Integraciones</CardTitle>
                            <CardDescription>
                                Conecta tus herramientas favoritas para potenciar tu flujo de trabajo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base font-semibold">Slack</CardTitle>
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Recibe notificaciones en tu canal de Slack.</p>
                                    <Button variant="outline" size="sm" className="mt-4 w-full">Configurar</Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base font-semibold">Google Calendar</CardTitle>
                                     <Trash2 className="h-5 w-5 text-destructive" />
                                </CardHeader>
                                <CardContent>
                                     <p className="text-sm text-muted-foreground">Sincroniza entrevistas con tu calendario.</p>
                                     <Button variant="outline" size="sm" className="mt-4 w-full">Configurar</Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base font-semibold">Google Meet</CardTitle>
                                     <Video className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                     <p className="text-sm text-muted-foreground">Programa reuniones y entrevistas directamente.</p>
                                     <Button variant="outline" size="sm" className="mt-4 w-full">Conectar</Button>
                                </CardContent>
                            </Card>
                            <Card className="flex flex-col justify-center items-center border-dashed">
                                 <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                 <p className="text-sm font-medium text-muted-foreground">Añadir Integración</p>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>
                )}
            </Tabs>
        </>
    );
}
