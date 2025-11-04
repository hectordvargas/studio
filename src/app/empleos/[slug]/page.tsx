'use client';

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Job, Company } from "@/lib/data";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
    MapPin, 
    Briefcase, 
    Clock, 
    DollarSign, 
    GraduationCap, 
    BookUser, 
    Languages,
    HeartHandshake,
    CalendarClock,
    PlusCircle,
    Building,
    Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo, useState, useEffect } from "react";

export default function JobPublicPage({ params }: { params: { slug: string } }) {
    const firestore = useFirestore();

    const jobsQuery = useMemoFirebase(() => {
        if (!firestore || !params.slug) return null;
        return query(collection(firestore, 'jobs'), where('slug', '==', params.slug), limit(1));
    }, [firestore, params.slug]);

    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    const job = useMemo(() => jobs?.[0], [jobs]);

    const companyId = job?.companyId;
    const companyRef = useMemoFirebase(() => {
        if (!firestore || !companyId) return null;
        return doc(firestore, 'companies', companyId);
    }, [firestore, companyId]);
    const { data: company, isLoading: isLoadingCompany } = useDoc<Company>(companyRef);

    const isLoading = isLoadingJobs || isLoadingCompany;

    if (isLoading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    if (!job) {
        return notFound();
    }

    const getCoverUrl = (coverId: string) => {
        const image = PlaceHolderImages.find(img => img.id === coverId);
        return image ? image.imageUrl : 'https://picsum.photos/seed/placeholder/1200/400';
    }

    const formatSchedule = () => {
        if (!job.schedule) return 'No especificado';
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

    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
            <header className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden mb-8">
                <Image
                    src={getCoverUrl(job.coverImage)}
                    alt={`Cover image for ${job.title}`}
                    fill
                    className="object-cover"
                    data-ai-hint="office background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold">{job.title}</h1>
                    {company && (
                        <Link href={`/empleos/empresas/${company.id}`} className="flex items-center gap-2 mt-2 group">
                            <Avatar className="h-8 w-8 border-2 border-transparent group-hover:border-primary transition-colors">
                                <AvatarImage src={company.logo} />
                                <AvatarFallback>{company.name.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <p className="text-lg group-hover:underline">{company.name}</p>
                        </Link>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Descripción del Empleo</h2>
                        <p className="text-muted-foreground leading-relaxed">{job.description}</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Responsabilidades</h2>
                        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                            {job.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Requisitos Clave</h2>
                        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                            {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
                        </ul>
                    </div>

                    {job.benefits && job.benefits.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Beneficios</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {job.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                        <HeartHandshake className="h-5 w-5 text-primary" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="space-y-6">
                    <div className="sticky top-8 space-y-6">
                        <Card>
                             <CardHeader>
                                <Button className="w-full text-lg">Aplicar Ahora</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="text-lg font-semibold">Detalles del Empleo</h3>
                                <Separator />
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className='font-medium'>Ubicación</p>
                                            <p className="text-muted-foreground">{job.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className='font-medium'>Salario</p>
                                            <p className="text-muted-foreground">{job.salary.amount} {job.salary.currency}</p>
                                            {job.salary.commissions && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <PlusCircle className="h-3 w-3" />
                                                    <span>{job.salary.commissions}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className='font-medium'>Tipo de Contrato</p>
                                            <p className="text-muted-foreground">{job.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CalendarClock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className='font-medium'>Horario</p>
                                            <p className="text-muted-foreground">{formatSchedule()}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className='font-medium'>Publicado</p>
                                            <p className="text-muted-foreground">{job.postedDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Educacion Requerida</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <GraduationCap className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className='font-medium'>Nivel Educativo</p>
                                        <p className="text-muted-foreground">{job.education.level} en {job.education.career}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <BookUser className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className='font-medium'>Competencias</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {job.competencies.map((skill, index) => (
                                                <Badge key={index} variant="secondary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Languages className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className='font-medium'>Idiomas</p>
                                        <ul className='list-disc pl-5 text-muted-foreground mt-1'>
                                            {job.languages.map((lang, i) => <li key={i}>{lang.name} - {lang.level}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </aside>
            </div>
        </div>
    );
}
