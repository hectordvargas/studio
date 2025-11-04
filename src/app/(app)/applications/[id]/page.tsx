'use client';

import { notFound, useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Application, Job, Candidate, Company, User } from "@/lib/data";
import { psychometricCategories, technicalTests, Evaluation, Question } from "@/lib/evaluations-data";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User as UserIcon, Briefcase, Sparkles, Wand2, Loader2, CheckCircle, XCircle, FileText, ChevronDown, ClipboardList, Languages, Lightbulb, MessageSquareQuote, CircleDot, Circle, FileClock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeCandidateProfile } from "@/ai/flows/analyze-candidate-profiles";
import type { AnalyzeCandidateProfileOutput } from "@/ai/flows/analyze-candidate-profiles";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { useTranslation, useLanguage } from "../../layout";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";


type AssignedEvaluation = Evaluation & {
    status: 'Pending' | 'In Progress' | 'Completed';
    score?: number;
};

type AnalysisState = {
    es: AnalyzeCandidateProfileOutput | null;
    en: AnalyzeCandidateProfileOutput | null;
}

export default function ApplicationDetailPage() {
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const { t } = useTranslation();
    const { language } = useLanguage();
    const firestore = useFirestore();

    const applicationRef = useMemoFirebase(() => firestore ? doc(firestore, 'applications', params.id) : null, [firestore, params.id]);
    const { data: application, isLoading: isLoadingApplication } = useDoc<Application>(applicationRef);
    
    const candidateRef = useMemoFirebase(() => firestore && application ? doc(firestore, 'candidates', application.candidateId) : null, [firestore, application]);
    const { data: candidate, isLoading: isLoadingCandidate } = useDoc<Candidate>(candidateRef);
    
    const jobRef = useMemoFirebase(() => firestore && application ? doc(firestore, 'jobs', application.jobId) : null, [firestore, application]);
    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(jobRef);

    const companyRef = useMemoFirebase(() => firestore && job ? doc(firestore, 'companies', job.companyId) : null, [firestore, job]);
    const { data: company, isLoading: isLoadingCompany } = useDoc<Company>(companyRef);

    const [analysis, setAnalysis] = useState<AnalysisState>({ es: null, en: null });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    useEffect(() => {
        if (application?.analysis) {
            setAnalysis(application.analysis);
        }
    }, [application]);

    const allEvaluations = useMemo(() => [...psychometricCategories.flatMap(c => c.tests), ...technicalTests], []);
    
    const [assignedEvaluations, setAssignedEvaluations] = useState<AssignedEvaluation[]>([]);
    
    useEffect(() => {
        if (application && allEvaluations.length > 0 && application.assignedEvaluations) {
            const initialAssigned = application.assignedEvaluations.map(appEval => {
                const evalDetails = allEvaluations.find(e => e.id === appEval.evaluationId);
                if (!evalDetails) return null;
                return {
                    ...evalDetails,
                    status: appEval.status as 'Pending' | 'In Progress' | 'Completed',
                    score: appEval.score,
                };
            }).filter((e): e is AssignedEvaluation => e !== null);
            setAssignedEvaluations(initialAssigned);
        }
    }, [application, allEvaluations]);

    const [isCustomizing, setIsCustomizing] = useState(false);
    const [tempSelectedEvaluations, setTempSelectedEvaluations] = useState<AssignedEvaluation[]>(assignedEvaluations);

    const handleAnalyzeProfile = async () => {
        if (!candidate || !job || !applicationRef) return;
        setIsAnalyzing(true);
        setAnalysis({ es: null, en: null });
        try {
            const candidateProfileText = `
                Summary: ${candidate.profile.summary}
                Skills: ${candidate.profile.skills.join(', ')}
                Experience: ${candidate.profile.experience.map(e => `${e.title} at ${e.company}`).join('; ')}
            `;

            const [esResult, enResult] = await Promise.all([
                analyzeCandidateProfile({
                    candidateProfile: candidateProfileText,
                    jobDescription: job.description,
                    language: 'es'
                }),
                analyzeCandidateProfile({
                    candidateProfile: candidateProfileText,
                    jobDescription: job.description,
                    language: 'en'
                })
            ]);
            
            const newAnalysis = { es: esResult, en: enResult };
            setAnalysis(newAnalysis);

            updateDocumentNonBlocking(applicationRef, { analysis: newAnalysis });

            toast({
                title: "Análisis Completado y Guardado",
                description: `El perfil ha sido analizado en Español e Inglés.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error de Análisis',
                description: "No se pudo completar el análisis del perfil."
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getAvatarUrl = (avatarId: string | undefined) => {
        if (!avatarId) return 'https://picsum.photos/seed/placeholder/100/100';
        const image = PlaceHolderImages.find(img => img.id === avatarId);
        return image ? image.imageUrl : `https://picsum.photos/seed/${avatarId}/100/100`;
    };

    const handleEvaluationToggle = (evaluation: Evaluation, checked: boolean) => {
        setTempSelectedEvaluations(prev => {
            if (checked) {
                const existing = prev.find(e => e.id === evaluation.id);
                if (existing) return prev;
                return [...prev, { ...evaluation, status: 'Pending' }];
            } else {
                return prev.filter(e => e.id !== evaluation.id);
            }
        });
    };

    const handleSaveCustomization = () => {
        if (!applicationRef) return;
        
        const newAssignedEvaluations = tempSelectedEvaluations.map(({ id, status, score }) => ({
            evaluationId: id,
            status: status,
            ...(score !== undefined && { score }),
        }));
        
        updateDocumentNonBlocking(applicationRef, { assignedEvaluations: newAssignedEvaluations });

        setAssignedEvaluations(tempSelectedEvaluations);
        setIsCustomizing(false);
        toast({
            title: "Evaluaciones Actualizadas",
            description: "La lista de evaluaciones asignadas ha sido guardada en la base de datos.",
        });
    };
    
    const getStatusIcon = (status: AssignedEvaluation['status']) => {
        switch (status) {
            case 'Pending': return <FileClock className="h-5 w-5 text-muted-foreground" />;
            case 'In Progress': return <CircleDot className="h-5 w-5 text-blue-500 animate-pulse" />;
            case 'Completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
            default: return <Circle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getSpanishEvaluationStatus = (status: AssignedEvaluation['status']) => {
        switch (status) {
            case 'Pending': return 'No Iniciada';
            case 'In Progress': return 'En Progreso';
            case 'Completed': return 'Completada';
            default: return 'Pendiente';
        }
    };
    
    const currentAnalysis = analysis[language || 'es'];

    const isLoading = isLoadingApplication || isLoadingCandidate || isLoadingJob || isLoadingCompany;

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    if (!application || !candidate || !job || !company) {
        notFound();
    }

    return (
        <>
            <DashboardHeader title={`Aplicación de ${candidate.name}`}>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/jobs/${job.id}`}>
                            <ArrowLeft className="mr-2" />
                            Volver a la Plaza
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/candidates/${candidate.id}`}>
                            <UserIcon className="mr-2" />
                            Ver Perfil del Candidato
                        </Link>
                    </Button>
                </div>
            </DashboardHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Análisis de Perfil con IA</CardTitle>
                            <CardDescription>
                                Compara el perfil del candidato con los requisitos de la plaza para identificar coincidencias y carencias.
                            </CardDescription>
                             {currentAnalysis && (
                                <div className="pt-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">Nivel de Afinidad</span>
                                        <span className="text-lg font-bold text-primary">{currentAnalysis.suitabilityScore}%</span>
                                    </div>
                                    <Progress value={currentAnalysis.suitabilityScore} />
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleAnalyzeProfile} disabled={isAnalyzing}>
                                    {isAnalyzing ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                                    {isAnalyzing ? "Analizando Perfil..." : "Analizar Perfil con IA"}
                                </Button>
                            </div>

                            {currentAnalysis && (
                                <div className="mt-6 space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">Resumen del Análisis</h3>
                                        <p className="text-sm text-muted-foreground">{currentAnalysis.summary}</p>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle className="text-green-500" /> Puntos Fuertes (Coincidencias)</h3>
                                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                                {currentAnalysis.skillMatches.map((match, i) => <li key={`match-${i}`}>{match}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2"><XCircle className="text-red-500" /> Oportunidades (Carencias)</h3>
                                             <ul className="list-disc pl-5 space-y-1 text-sm">
                                                {currentAnalysis.skillGaps.map((gap, i) => <li key={`gap-${i}`}>{gap}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                     <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="text-yellow-500"/> Sugerencias</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            {currentAnalysis.suggestions.map((suggestion, i) => <li key={`suggestion-${i}`}>{suggestion}</li>)}
                                        </ul>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-2 flex items-center gap-2"><MessageSquareQuote className="text-blue-500"/> Preguntas Recomendadas</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            {currentAnalysis.recommendedQuestions.map((question, i) => <li key={`question-${i}`}>{question}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluaciones Asignadas</CardTitle>
                            <CardDescription>
                                Gestiona y asigna las evaluaciones psicométricas y técnicas para este candidato.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                                {assignedEvaluations.map(evaluation => (
                                    <div key={evaluation.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(evaluation.status)}
                                            <div>
                                                <p className="font-medium">{evaluation.name}</p>
                                                <p className="text-xs text-muted-foreground">{evaluation.type} • {evaluation.duration}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {evaluation.status === 'Completed' && evaluation.score !== undefined ? (
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">{evaluation.score}%</p>
                                                    <p className="text-xs text-muted-foreground">Puntuación</p>
                                                </div>
                                            ) : (
                                                <Badge variant="outline">{getSpanishEvaluationStatus(evaluation.status)}</Badge>
                                            )}
                                            {evaluation.status === 'Completed' && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/evaluations/${evaluation.id}/report`}>
                                                        <Eye className="mr-2 h-4 w-4"/>
                                                        Ver Reporte
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {assignedEvaluations.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No hay evaluaciones asignadas. Personaliza la selección para empezar.</p>
                                )}
                           </div>
                            <div className="mt-4 flex justify-between items-center">
                                <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" onClick={() => {
                                            setTempSelectedEvaluations(assignedEvaluations);
                                            setIsCustomizing(true);
                                        }}>Personalizar Evaluaciones</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle>Personalizar Evaluaciones para {candidate.name}</DialogTitle>
                                            <DialogDescription>
                                                Selecciona las pruebas que deseas asignar a este candidato para la plaza de {job.title}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Tabs defaultValue="psychometric" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="psychometric">Psicométricas</TabsTrigger>
                                                <TabsTrigger value="technical">Técnicas</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="psychometric" className="max-h-[50vh] overflow-y-auto p-1">
                                                <Accordion type="multiple" className="w-full">
                                                    {psychometricCategories.map(category => (
                                                        <AccordionItem value={category.name} key={category.name}>
                                                            <AccordionTrigger>{category.name}</AccordionTrigger>
                                                            <AccordionContent>
                                                                {category.tests.map(test => (
                                                                    <div key={test.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                                                        <Checkbox 
                                                                            id={`customize-${test.id}`}
                                                                            checked={tempSelectedEvaluations.some(e => e.id === test.id)}
                                                                            onCheckedChange={(checked) => handleEvaluationToggle(test, !!checked)}
                                                                        />
                                                                        <Label htmlFor={`customize-${test.id}`} className="flex-1 cursor-pointer">
                                                                            <span className="font-medium">{test.name}</span>
                                                                            <p className="text-xs text-muted-foreground">{test.description}</p>
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            </TabsContent>
                                            <TabsContent value="technical" className="max-h-[50vh] overflow-y-auto p-1">
                                                {technicalTests.map(test => (
                                                    <div key={test.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                                        <Checkbox 
                                                            id={`customize-${test.id}`}
                                                            checked={tempSelectedEvaluations.some(e => e.id === test.id)}
                                                            onCheckedChange={(checked) => handleEvaluationToggle(test, !!checked)}
                                                        />
                                                        <Label htmlFor={`customize-${test.id}`} className="flex-1 cursor-pointer">
                                                            <span className="font-medium">{test.name}</span>
                                                            <p className="text-xs text-muted-foreground">{test.description}</p>
                                                        </Label>
                                                    </div>
                                                ))}
                                            </TabsContent>
                                        </Tabs>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="ghost">Cancelar</Button>
                                            </DialogClose>
                                            <Button onClick={handleSaveCustomization}>Guardar Cambios</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button>
                                    <ClipboardList className="mr-2" />
                                    Enviar Recomendaciones
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Análisis de Entrevista</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea placeholder="Pega aquí las notas o transcripción de la entrevista..." rows={8} />
                             <div className="flex items-center gap-2">
                                <Label htmlFor="interview-file" className="text-sm text-muted-foreground">O sube un archivo:</Label>
                                <Input 
                                    id="interview-file" 
                                    type="file"
                                    className="max-w-xs" 
                                    accept=".txt,.md,.pdf,.doc,.docx"
                                />
                            </div>
                            <Button>
                                <Sparkles className="mr-2" />
                                Analizar Entrevista con IA
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>Información General</CardTitle>
                                <Badge>{getSpanishStatus(application.status)}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={getAvatarUrl(candidate.avatar)} />
                                    <AvatarFallback>{candidate.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                                </div>
                            </div>
                            <Separator />
                             <div className="space-y-2 text-sm">
                                <div className="flex gap-2 items-start">
                                    <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{job.title}</p>
                                        <p className="text-muted-foreground">{company.name}</p>
                                    </div>
                                </div>
                                 <div className="flex gap-2 items-center">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span>Aplicó el {application.applicationDate}</span>
                                </div>
                             </div>
                             <div className="flex justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            Cambiar Estado <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Revisión</DropdownMenuItem>
                                        <DropdownMenuItem>Entrevista</DropdownMenuItem>
                                        <DropdownMenuItem>Evaluación</DropdownMenuItem>
                                        <DropdownMenuItem>Oferta</DropdownMenuItem>
                                        <DropdownMenuItem>Contratado</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Rechazado</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function getSpanishStatus(status: Application['status']) {
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
    