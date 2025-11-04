'use client';

import { notFound, useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building, Calendar, Globe, Mail, Phone, Pencil, Users, Loader2, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Job, Company, Application, UserProfile } from "@/lib/data";
import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { useMemo } from "react";

export default function CompanyDetailPage() {
    const params = useParams<{ id: string }>();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const companyRef = useMemoFirebase(() => {
        if (!firestore || !params.id) return null;
        return doc(firestore, 'companies', params.id);
    }, [firestore, params.id]);
    const { data: company, isLoading: isLoadingCompany } = useDoc<Company>(companyRef);

    const jobsRef = useMemoFirebase(() => {
        if (!firestore || !params.id) return null;
        return query(collection(firestore, 'jobs'), where('companyId', '==', params.id));
    }, [firestore, params.id]);
    const { data: companyJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsRef);
    
    const applicationsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'applications');
    }, [firestore]);
    const { data: applications, isLoading: isLoadingApplications } = useCollection<Application>(applicationsRef);

    const isLoading = isLoadingCompany || isLoadingJobs || isLoadingApplications;

    const jobsWithCounts = useMemo(() => {
        if (!companyJobs || !applications) return [];
        return companyJobs.map(job => ({
            ...job,
            candidateCount: applications.filter(app => app.jobId === job.id).length
        }));
    }, [companyJobs, applications]);
    
    const canManageCompany = useMemo(() => {
        if (!userProfile) return false;
        return userProfile.role === 'root' || userProfile.role === 'Superadmin' || userProfile.role === 'Distribuidor' || (userProfile.role === 'Administrador' && userProfile.companyIds?.includes(params.id));
    }, [userProfile, params.id]);

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!company) {
        return notFound();
    }

    const mainAddress = company.addresses?.find(a => a.type === 'Sede Principal');
    const branchAddresses = company.addresses?.filter(a => a.type === 'Filial');
    
    const getBadgeVariant = (status: Job['status']) => {
        switch (status) {
            case 'Open': return 'default';
            case 'Closed': return 'secondary';
            default: return 'outline';
        }
    }
    
    const getSpanishStatus = (status: Job['status']) => {
        switch (status) {
            case 'Open': return 'Abierta';
            case 'Closed': return 'Cerrada';
            case 'Archived': return 'Archivada';
            case 'Cancelled': return 'Cancelada';
            default: return status;
        }
    }

    return (
        <>
            <DashboardHeader
                title={company.name}
            >
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/companies">
                            <ArrowLeft className="mr-2" />
                            Volver a Empresas
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/empleos/empresas/${company.id}`} target="_blank">
                            <Globe className="mr-2" />
                            Vista Pública
                        </Link>
                    </Button>
                    {canManageCompany && (
                        <>
                            <Button variant="outline" asChild>
                                <Link href={`/companies/${company.id}/users`}>
                                    <Users className="mr-2" />
                                    Gestionar Usuarios
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/companies/${company.id}/edit`}>
                                    <Pencil className="mr-2" />
                                    Editar Empresa
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </DashboardHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={company.logo} />
                                <AvatarFallback>{company.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">{company.name}</h2>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Empresa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <p className="text-muted-foreground">{company.description}</p>
                            <Separator/>
                            
                            {company.website && (
                                <div className="flex items-start gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <a href={company.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{company.website}</a>
                                </div>
                            )}
                            {company.email && (
                                <div className="flex items-start gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span>{company.email}</span>
                                </div>
                            )}
                            {company.phone && (
                                 <div className="flex items-start gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span>{company.phone}</span>
                                </div>
                            )}
                            {company.foundedDate && (
                                <div className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <span>Fundada en {company.foundedDate}</span>
                                </div>
                            )}
                            {mainAddress && (
                                <div className="flex items-start gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <span>{mainAddress.branchName || mainAddress.address1} (Sede Principal)</span>
                                        <p className="text-xs text-muted-foreground">{`${mainAddress.city}, ${mainAddress.country}`}</p>
                                    </div>
                                </div>
                            )}

                            {branchAddresses && branchAddresses.length > 0 && (
                                <>
                                <Separator/>
                                <h4 className="font-medium">Otras Sedes</h4>
                                <div className="space-y-3">
                                {branchAddresses.map(address => (
                                    <div key={address.id} className="flex items-start gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div>
                                            <span>{address.branchName || address.address1}</span>
                                            <p className="text-xs text-muted-foreground">{`${address.city}, ${address.country}`}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Plazas de Trabajo Publicadas</CardTitle>
                                <CardDescription>
                                    Un listado de todas las plazas activas y pasadas de {company.name}.
                                </CardDescription>
                            </div>
                            {canManageCompany && (
                                <Button asChild>
                                    <Link href="/jobs/new">
                                        <PlusCircle className="mr-2"/>
                                        Publicar Plaza
                                    </Link>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Departamento</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Candidatos</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jobsWithCounts && jobsWithCounts.length > 0 && jobsWithCounts.map(job => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                                            </TableCell>
                                            <TableCell>{job.department}</TableCell>
                                            <TableCell>
                                                <Badge variant={getBadgeVariant(job.status)}>{getSpanishStatus(job.status)}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{job.candidateCount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {(!jobsWithCounts || jobsWithCounts.length === 0) && (
                                <p className="text-center text-muted-foreground py-8">Esta empresa aún no ha publicado ninguna plaza.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
