'use client';

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultFooterContent } from "./layout";
import { Job, Company } from "@/lib/data";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";


function PublicFooter({ content }: { content: string }) {
    return (
        <footer className="bg-muted text-muted-foreground py-8">
            <div
                className="container mx-auto max-w-5xl text-center text-xs space-y-2"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </footer>
    );
}

export default function PublicJobsPage() {
    const firestore = useFirestore();
    
    const jobsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'jobs'), where('status', '==', 'Open')) : null, [firestore]);
    const { data: openJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const companiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'companies') : null, [firestore]);
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<Company>(companiesQuery);

    const isLoading = isLoadingJobs || isLoadingCompanies;

    return (
        <>
            <div className="container mx-auto max-w-5xl py-8 px-4">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Encuentra tu Próximo Desafío</h1>
                    <p className="text-lg text-muted-foreground">Explora las oportunidades disponibles en nuestras empresas asociadas.</p>
                </header>
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                <div className="space-y-6">
                    {openJobs?.map(job => {
                        const company = companies?.find(c => c.id === job.companyId);
                        if (!company) return null;

                        return (
                            <Card key={job.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-xl">
                                                <Link href={`/empleos/${job.slug}`} className="hover:underline">
                                                    {job.title}
                                                </Link>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Avatar className="h-6 w-6 border">
                                                    <AvatarImage src={company.logo} alt={`${company.name} logo`} />
                                                    <AvatarFallback>{company.name.substring(0,1)}</AvatarFallback>
                                                </Avatar>
                                                <Link href={`/empleos/empresas/${company.id}`} className="hover:underline font-medium">
                                                    {company.name}
                                                </Link>
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary">{job.type}</Badge>
                                    </div>
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
                                </div>
                                    <Button asChild>
                                        <Link href={`/empleos/${job.slug}`}>Ver Detalles</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                     {openJobs?.length === 0 && (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-medium text-muted-foreground">No hay plazas abiertas en este momento.</h3>
                            <p className="text-sm text-muted-foreground mt-2">Vuelve a consultar más tarde para ver nuevas oportunidades.</p>
                        </div>
                    )}
                </div>
                )}
            </div>
            <PublicFooter content={defaultFooterContent} />
        </>
    );
}
