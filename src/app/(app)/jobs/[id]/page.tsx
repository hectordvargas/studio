'use client';

import Image from 'next/image';
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

import { Application, Job, Candidate, User, Company } from "@/lib/data";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';


import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
    Loader2, 
    Sparkles, 
    ClipboardList, 
    MapPin, 
    Briefcase, 
    Clock, 
    DollarSign, 
    GraduationCap, 
    BookUser, 
    Languages,
    Award,
    Pencil, 
    Building,
    CalendarClock,
    PlusCircle,
    HeartHandshake,
    ChevronDown,
    Link2,
    Package,
    Globe,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { recommendSuitableAssessments } from '@/ai/flows/recommend-suitable-assessments';
import { cn } from '@/lib/utils';

type RankedCandidate = Candidate & { 
    rank?: number; 
    score?: number; 
    justification?: string;
    isRanking?: boolean;
    applicationId: string;
};

const mockRankedData: { [key: string]: { score: number; justification: string } } = {
    'c1': { score: 92, justification: 'Alineación excepcional con todas las habilidades clave y un sólido desempeño en la entrevista.' },
    'c2': { score: 85, justification: 'Fuerte encaje con la cultura de la empresa y experiencia relevante en proyectos similares.' },
    'c3': { score: 68, justification: 'Buen potencial, pero carece de experiencia en algunas habilidades secundarias como GraphQL.' },
    'c4': { score: 78, justification: 'Habilidades técnicas sólidas, aunque con menos experiencia en liderazgo que otros candidatos.' },
};

export default function JobDetailPage() {
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const [isRankingAll, setIsRankingAll] = useState(false);
    const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendedAssessments, setRecommendedAssessments] = useState<string[]>([]);

    const jobRef = useMemoFirebase(() => firestore ? doc(firestore, 'jobs', params.id) : null, [firestore, params.id]);
    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(jobRef);

    const companyRef = useMemoFirebase(() => firestore && job ? doc(firestore, 'companies', job.companyId) : null, [firestore, job]);
    const { data: company, isLoading: isLoadingCompany } = useDoc<Company>(companyRef);

    const applicationsRef = useMemoFirebase(() => firestore ? query(collection(firestore, 'applications'), where('jobId', '==', params.id)) : null, [firestore, params.id]);
    const { data: jobApplications, isLoading: isLoadingApps } = useCollection<Application>(applicationsRef);

    const candidateIds = useMemo(() => jobApplications?.map(app => app.candidateId) || [], [jobApplications]);
    
    const candidatesRef = useMemoFirebase(() => {
        if (!firestore || candidateIds.length === 0) return null;
        return query(collection(firestore, 'candidates'), where('__name__', 'in', candidateIds));
    }, [firestore, candidateIds]);
    const { data: allCandidates, isLoading: isLoadingCandidates } = useCollection<Candidate>(candidatesRef);

    const recruitersRef = useMemoFirebase(() => {
        if (!firestore || !job?.assignedRecruiters || job.assignedRecruiters.length === 0) return null;
        return query(collection(firestore, 'users'), where('__name__', 'in', job.assignedRecruiters));
    }, [firestore, job]);
    const { data: assignedRecruiters, isLoading: isLoadingRecruiters } = useCollection<User>(recruitersRef);

    const interviewersRef = useMemoFirebase(() => {
        if (!firestore || !job?.assignedInterviewers || job.assignedInterviewers.length === 0) return null;
        return query(collection(firestore, 'users'), where('__name__', 'in', job.assignedInterviewers));
    }, [firestore, job]);
    const { data: assignedInterviewers, isLoading: isLoadingInterviewers } = useCollection<User>(interviewersRef);

    const isLoading = isLoadingJob || isLoadingCompany || isLoadingApps || isLoadingCandidates || isLoadingRecruiters || isLoadingInterviewers;
    
    useEffect(() => {
        if (jobApplications && allCandidates) {
            const initialCandidates: RankedCandidate[] = jobApplications
                .map(app => {
                    const candidateProfile = allCandidates.find(c => c.id === app.candidateId);
                    if (!candidateProfile) return null;
                    return { ...candidateProfile, applicationId: app.id, isRanking: false };
                })
                .filter((c): c is RankedCandidate => c !== null);
            setCandidates(initialCandidates);
        }
    }, [jobApplications, allCandidates]);


    const getAvatarUrl = (avatarId: string | undefined) => {
        if (!avatarId) return 'https://picsum.photos/seed/placeholder/100/100';
        const image = PlaceHolderImages.find(img => img.id === avatarId);
        return image ? image.imageUrl : `https://picsum.photos/seed/${avatarId}/100/100`;
    }
    
    const getCoverUrl = (coverId: string | undefined) => {
        if (!coverId) return 'https://picsum.photos/seed/placeholder/1200/400';
        const image = PlaceHolderImages.find(img => img.id === coverId);
        return image ? image.imageUrl : `https://picsum.photos/seed/${coverId}/1200/400`;
    }

    const handleRankCandidates = async () => {
        setIsRankingAll(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setCandidates(currentCandidates => {
                const ranked = currentCandidates.map(c => ({
                    ...c,
                    score: mockRankedData[c.id]?.score || Math.floor(Math.random() * 50) + 50,
                    justification: mockRankedData[c.id]?.justification || 'Análisis autogenerado por la IA.',
                })).sort((a, b) => (b.score || 0) - (a.score || 0));
                
                return ranked.map((c, index) => ({...c, rank: index + 1 }));
            });
            toast({
                title: 'Clasificación Completa',
                description: 'Los candidatos han sido clasificados por la IA.',
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Falló la Clasificación',
                description: 'No se pudo conectar con el servicio de IA.',
            })
        }
        setIsRankingAll(false);
    }
    
    const handleRankIndividualCandidate = async (candidateId: string) => {
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isRanking: true } : c));
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setCandidates(prev => prev.map(c => {
                if (c.id === candidateId) {
                    return {
                        ...c,
                        score: mockRankedData[c.id]?.score || Math.floor(Math.random() * 50) + 40,
                        justification: mockRankedData[c.id]?.justification || 'Análisis individual autogenerado.',
                        isRanking: false
                    }
                }
                return c;
            }));
             toast({
                title: 'Análisis Individual Completo',
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Falló el Análisis',
                description: 'No se pudo analizar al candidato.',
            })
            setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isRanking: false } : c));
        }
    }


     const handleRecommendAssessments = async () => {
        if (!job?.description) return;
        setIsRecommending(true);
        setRecommendedAssessments([]);
        try {
            const response = await recommendSuitableAssessments({ jobDescription: job.description });
            setRecommendedAssessments(response.assessments);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error de IA",
                description: "No se pudieron generar las recomendaciones.",
            });
        } finally {
            setIsRecommending(false);
        }
    };
    
    const formatSchedule = () => {
        if (!job?.schedule) return 'No especificado';
        switch (job.schedule.type) {
            case 'Fixed':
                return `${job.schedule.entryTime} - ${job.schedule.exitTime}`;
            case 'Flexible':
            case 'Custom':
                return job.schedule.details || job.schedule.type;
            default:
                return 'No especificado';
        }
    }
    
    const getBadgeVariant = (status: Job['status']) => {
        switch (status) {
            case 'Open': return 'default';
            case 'Closed': return 'secondary';
            case 'Cancelled': return 'destructive';
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
    
    const getSpanishCandidateStatus = (status: Application['status'] | undefined) => {
        if (!status) return 'Pendiente';
        switch (status) {
            case 'Pending': return 'Pendiente';
            case 'Screening': return 'Revisión';
            case 'Interview': return 'Entrevista';
            case 'Assessment': return 'Evaluación';
            case 'Offer': return 'Oferta';
            case 'Hired': return 'Contratado';
            case 'Rejected': return 'Rechazado';
            default: return status;
        }
    }

    const getScoreColor = (score?: number) => {
        if (score === undefined) return '';
        if (score > 85) return 'text-green-600';
        if (score > 70) return 'text-orange-500';
        if (score > 50) return 'text-yellow-500';
        return 'text-red-500';
    }

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!job) {
        return notFound();
    }


    return (
        <>
            <DashboardHeader title={job.title} description={`${job.department} en ${company?.name}`}>
                <div className="flex items-center gap-2">
                     {job.slug && (
                        <Button variant="outline" asChild>
                            <Link href={`/empleos/${job.slug}`} target="_blank">
                                <Link2 className="mr-2"/>
                                Página Pública
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href={`/jobs/${job.id}/edit`}>
                            <Pencil className="mr-2"/>
                            Editar Plaza
                        </Link>
                    </Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Cambiar Estado
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Marcar como Abierta</DropdownMenuItem>
                            <DropdownMenuItem>Marcar como Cerrada</DropdownMenuItem>
                            <DropdownMenuItem>Archivar</DropdownMenuItem>
                            <DropdownMenuItem>Marcar como Cancelada</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </DashboardHeader>

            <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden mb-6">
                <Image 
                    src={getCoverUrl(job.coverImage)} 
                    alt={`Cover image for ${job.title}`}
                    fill
                    style={{objectFit: 'cover'}}
                    data-ai-hint="office background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-bold">{job.title}</h2>
                    <div className='flex items-center gap-4'>
                        <p className="flex items-center gap-2"><Building className="h-4 w-4"/> {company?.name}</p>
                        <Badge variant={getBadgeVariant(job.status)} className="text-sm">{getSpanishStatus(job.status)}</Badge>
                    </div>
                </div>
            </div>


            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Descripción del Empleo</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground">{job.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Responsabilidades</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                                {job.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                    
                    {job.benefits && job.benefits.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Beneficios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                                    {job.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                        <HeartHandshake className="h-4 w-4 text-primary" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Candidatos</CardTitle>
                            <CardDescription>Postulantes para esta posición.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="mb-4 flex justify-end">
                                <Button onClick={handleRankCandidates} disabled={isRankingAll || candidates.length === 0}>
                                    {isRankingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                                    {isRankingAll ? 'Clasificando...' : 'Clasificar con IA'}
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {candidates.some(c => c.rank) && <TableHead className="w-[50px]">Rango</TableHead>}
                                        <TableHead>Candidato</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className='text-center'>Promedio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.length === 0 && !isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                Aún no hay candidatos para esta plaza.
                                            </TableCell>
                                        </TableRow>
                                    ) : candidates.map((candidate) => (
                                        <TableRow key={candidate.id}>
                                            {candidates.some(c => c.rank) && <TableCell className="font-bold text-lg text-center">{candidate.rank}</TableCell>}
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    <Link href={`/applications/${candidate.applicationId}`} className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={getAvatarUrl(candidate.avatar)} />
                                                            <AvatarFallback>{candidate.name.substring(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium hover:underline">{candidate.name}</p>
                                                            <p className="text-sm text-muted-foreground hidden sm:block">{candidate.email}</p>
                                                        </div>
                                                    </Link>
                                                    {candidate.justification && (
                                                        <p className="pl-11 text-xs text-muted-foreground italic border-l-2 border-slate-200 ml-1.5 pl-3">
                                                            {candidate.justification}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={jobApplications?.find(a => a.id === candidate.applicationId)?.status === 'Interview' ? 'default' : 'secondary'}>
                                                    {getSpanishCandidateStatus(jobApplications?.find(a => a.id === candidate.applicationId)?.status)}
                                                </Badge>
                                            </TableCell>
                                             <TableCell className="text-center">
                                                {candidate.isRanking ? (
                                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                                ) : candidate.score !== undefined ? (
                                                    <div className={cn("font-semibold text-lg", getScoreColor(candidate.score))}>
                                                        {candidate.score?.toFixed(1)}%
                                                    </div>
                                                ) : (
                                                    <Button variant="ghost" size="icon" onClick={() => handleRankIndividualCandidate(candidate.id)}>
                                                        <Sparkles className="h-5 w-5" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del Empleo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <span className='font-semibold mr-1'>Ubicación:</span>
                                    <span>{job.location}</span>
                                </div>
                            </div>
                             <div className="flex items-start gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <span className='font-semibold mr-1'>Salario:</span>
                                    <span>{job.salary.amount} {job.salary.currency}</span>
                                    {job.salary.commissions && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <PlusCircle className="h-3 w-3" />
                                            <span>{job.salary.commissions}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                 <span className='font-semibold mr-1'>Tipo:</span>
                                <span>{job.type}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                 <span className='font-semibold mr-1'>Cupos:</span>
                                <span>{job.vacancies}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                 <span className='font-semibold mr-1'>Horario:</span>
                                <span>{formatSchedule()}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                 <span className='font-semibold mr-1'>Publicado:</span>
                                <span>{job.postedDate}</span>
                            </div>
                            {job.slug && (
                            <div className="flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                <span className='font-semibold mr-1'>URL:</span>
                                <Link href={`/empleos/${job.slug}`} className='text-primary hover:underline truncate'>
                                    /empleos/{job.slug}
                                </Link>
                            </div>
                            )}
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Requisitos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><GraduationCap className="h-4 w-4"/> Educación</h4>
                                <p className="text-sm text-muted-foreground">{job.education.level} en {job.education.career}</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Award className="h-4 w-4"/> Experiencia</h4>
                                <p className="text-sm text-muted-foreground">{job.experience}</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><BookUser className="h-4 w-4"/> Competencias</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.competencies.map((skill, index) => (
                                        <Badge key={index} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                             <Separator />
                             <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Languages className="h-4 w-4"/> Idiomas</h4>
                                <ul className='list-disc pl-5 text-sm text-muted-foreground'>
                                    {job.languages.map((lang, i) => <li key={i}>{lang.name} - {lang.level}</li>)}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {(assignedRecruiters && assignedRecruiters.length > 0 || assignedInterviewers && assignedInterviewers.length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Equipo de Contratación</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {assignedRecruiters && assignedRecruiters.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm">Reclutadores</h4>
                                        <div className="space-y-3">
                                            {assignedRecruiters.map(user => (
                                            <div key={user.id} className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={getAvatarUrl(user.avatar)}/>
                                                    <AvatarFallback>{user.name?.substring(0,2)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                                                </div>
                                            </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {assignedInterviewers && assignedInterviewers.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm">Entrevistadores</h4>
                                        <div className="space-y-3">
                                            {assignedInterviewers.map(user => (
                                            <div key={user.id} className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={getAvatarUrl(user.avatar)}/>
                                                    <AvatarFallback>{user.name?.substring(0,2)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                                                </div>
                                            </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}


                    <Card>
                        <CardHeader>
                            <CardTitle>Recomendaciones de IA</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full" onClick={handleRecommendAssessments}>
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Recomendar Evaluaciones
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Evaluaciones Recomendadas para {job.title}</DialogTitle>
                                        <DialogDescription>
                                            Basado en la descripción del trabajo, aquí hay algunas evaluaciones sugeridas.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {isRecommending ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <ul className="list-disc space-y-2 pl-5 mt-4">
                                            {recommendedAssessments.map((assessment, index) => (
                                                <li key={index}>{assessment}</li>
                                            ))}
                                        </ul>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
