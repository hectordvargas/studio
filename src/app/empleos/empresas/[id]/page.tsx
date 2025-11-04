'use client';

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job, Company } from "@/lib/data";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

function PublicFooter({ content }: { content: string }) {
    return (
        <footer className="bg-muted text-muted-foreground py-8 mt-12">
            <div
                className="container mx-auto max-w-5xl text-center text-xs space-y-2"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
            />
        </footer>
    );
}

export default function PublicCompanyPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();

    const companyRef = useMemoFirebase(() => firestore ? doc(firestore, 'companies', params.id) : null, [firestore, params.id]);
    const { data: company, isLoading: isLoadingCompany } = useDoc<Company>(companyRef);

    const jobsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'jobs'), where('companyId', '==', params.id), where('status', '==', 'Open'));
    }, [firestore, params.id]);
    const { data: companyJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsRef);

    const isLoading = isLoadingCompany || isLoadingJobs;


    if (isLoading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (!company) {
        notFound();
    }

    return (
        <>
            <div className="container mx-auto max-w-5xl py-8 px-4">
                <header className="mb-12">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-2">
                            <AvatarImage src={company.logo} alt={`${company.name} logo`} />
                            <AvatarFallback>{company.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-4xl font-bold">{company.name}</h1>
                            <p className="text-lg text-muted-foreground mt-1">{company.description}</p>
                        </div>
                    </div>
                </header>

                <div>
                    <h2 className="text-3xl font-semibold mb-6">Plazas Abiertas</h2>
                    {companyJobs && companyJobs.length > 0 ? (
                        <div className="space-y-6">
                            {companyJobs.map(job => (
                                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-xl">
                                            <Link href={`/empleos/${job.slug}`} className="hover:underline">
                                                {job.title}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription>
                                            <Link href={`/empleos/empresas/${company.id}`} className="hover:underline font-medium">
                                                {company.name}
                                            </Link>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                                    </CardContent>
                                    <CardFooter className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Briefcase className="h-4 w-4" />
                                                <span>{job.department}</span>
                                            </div>
                                            <Badge variant="secondary">{job.type}</Badge>
                                    </div>
                                        <Button asChild>
                                            <Link href={`/empleos/${job.slug}`}>Ver Detalles</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-medium text-muted-foreground">No hay plazas abiertas en este momento.</h3>
                            <p className="text-sm text-muted-foreground mt-2">Vuelve a consultar más tarde para ver nuevas oportunidades.</p>
                        </div>
                    )}
                </div>
            </div>
            {company.branding?.enableCustomFooter && company.branding.customFooter && (
                <PublicFooter content={company.branding.customFooter} />
            )}
        </>
    );
}
