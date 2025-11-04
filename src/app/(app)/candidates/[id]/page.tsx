'use client'

import { notFound, useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Building, Calendar, Loader2, Mail, Pencil, Wand2, Link as LinkIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateInterviewQuestions } from "@/ai/flows/generate-interview-questions";
import Link from "next/link";
import { Candidate, Job, Application } from "@/lib/data";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";

export default function CandidateDetailPage() {
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const [isLoading, setIsLoading] = useState(false);
    const [aiQuestions, setAiQuestions] = useState<{genericQuestions: string[], tailoredQuestions: string[]} | null>(null);
    const [selectedJobDescription, setSelectedJobDescription] = useState('');

    const candidateRef = useMemoFirebase(() => firestore ? doc(firestore, 'candidates', params.id) : null, [firestore, params.id]);
    const { data: candidate, isLoading: isLoadingCandidate } = useDoc<Candidate>(candidateRef);

    const applicationsRef = useMemoFirebase(() => {
        if (!firestore || !params.id) return null;
        return query(collection(firestore, 'applications'), where('candidateId', '==', params.id));
    }, [firestore, params.id]);
    const { data: applications, isLoading: isLoadingApplications } = useCollection<Application>(applicationsRef);

    const jobIds = useMemo(() => applications?.map(app => app.jobId) || [], [applications]);

    const jobsRef = useMemoFirebase(() => {
        if (!firestore || jobIds.length === 0) return null;
        return query(collection(firestore, 'jobs'), where('__name__', 'in', jobIds));
    }, [firestore, jobIds]);
    const { data: appliedJobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsRef);
    
    const isDataLoading = isLoadingCandidate || isLoadingApplications || isLoadingJobs;

    const getAvatarUrl = (avatarId: string | undefined) => {
        if (!avatarId) return 'https://picsum.photos/seed/placeholder/100/100';
        const image = PlaceHolderImages.find(img => img.id === avatarId);
        return image ? image.imageUrl : `https://picsum.photos/seed/${avatarId}/100/100`;
    }

    const handleGenerateQuestions = async () => {
        if (!selectedJobDescription) {
            toast({
                variant: 'destructive',
                title: 'Sin Descripción de Puesto',
                description: 'Por favor, selecciona una plaza para generar preguntas.'
            })
            return;
        }

        setIsLoading(true);
        setAiQuestions(null);
        try {
            const response = await generateInterviewQuestions({
              jobDescription: selectedJobDescription,
              candidateProfile: candidate?.profile.summary || '',
              genericQuestionsCount: 3,
              tailoredQuestionsCount: 3,
            });
            setAiQuestions(response);

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al Generar Preguntas',
                description: 'Hubo un problema al contactar el servicio de IA.'
            })
        } finally {
            setIsLoading(false);
        }
    }
    
    if (isDataLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!candidate) {
        notFound();
    }

    return (
        <>
            <DashboardHeader title="Perfil del Candidato">
                 <Button asChild>
                    <Link href={`/candidates/${candidate.id}/edit`}>
                        <Pencil className="mr-2"/>
                        Editar Perfil
                    </Link>
                </Button>
            </DashboardHeader>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preguntas de Entrevista Generadas por IA</CardTitle>
                            <CardDescription>Genera preguntas basadas en competencias y personalizadas para este candidato.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Selecciona una plaza de la lista de 'Aplicaciones Recientes' para usar su descripción como contexto..."
                                    value={selectedJobDescription}
                                    readOnly
                                />
                                <Button onClick={handleGenerateQuestions} disabled={isLoading || !selectedJobDescription}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generar Preguntas
                                </Button>
                                {aiQuestions && (
                                    <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Preguntas Genéricas</h4>
                                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                                {aiQuestions.genericQuestions.map((q, i) => <li key={`g-${i}`}>{q}</li>)}
                                            </ul>
                                        </div>
                                        <Separator/>
                                        <div>
                                            <h4 className="font-semibold mb-2">Preguntas Personalizadas</h4>
                                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                                 {aiQuestions.tailoredQuestions.map((q, i) => <li key={`t-${i}`}>{q}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen del Perfil</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{candidate.profile?.summary}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Experiencia Laboral</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {candidate.profile?.experience?.map((exp, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Briefcase className="h-5 w-5 text-primary"/>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{exp.title}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2"><Building className="h-4 w-4"/> {exp.company}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> {exp.duration}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="w-24 h-24 mb-4">
                                    <AvatarImage src={getAvatarUrl(candidate.avatar)} />
                                    <AvatarFallback>{candidate.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <h2 className="text-2xl font-semibold">{candidate.name}</h2>
                                <p className="text-muted-foreground">{candidate.jobTitle}</p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{candidate.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Habilidades</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {candidate.profile?.skills?.map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                        </CardContent>
                    </Card>

                    {appliedJobs && appliedJobs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Aplicaciones Recientes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {appliedJobs.map(job => (
                                    <Button 
                                        key={job.id} 
                                        variant="ghost"
                                        onClick={() => setSelectedJobDescription(job.description)}
                                        className="w-full justify-start h-auto"
                                    >
                                        <div className="flex items-center justify-between p-2 rounded-md transition-colors w-full">
                                            <div className="text-sm text-left">
                                                <p className="font-medium">{job.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {job.department}
                                                </p>
                                            </div>
                                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    )
}
