

'use client';

import { notFound, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Trash2, Wand2, Loader2, Sparkles, PackagePlus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { autofillJobDetails } from "@/ai/flows/autofill-job-details";
import { generateImageFromText } from "@/ai/flows/generate-image-from-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Job, Company, UserProfile } from "@/lib/data";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


const jobSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  slug: z.string().optional(),
  department: z.string().min(1, "El departamento es requerido."),
  companyId: z.string().min(1, "La empresa es requerida."),
  location: z.string().min(1, "Debes seleccionar una ubicación."),
  vacancies: z.coerce.number().min(1, "Debe haber al menos un cupo."),
  type: z.enum(["Full-time", "Part-time", "Contract"]),
  description: z.string().min(1, "La descripción es requerida."),
  responsibilities: z.array(z.object({ value: z.string().min(1, "La responsabilidad no puede estar vacía.") })).min(1, "Añade al menos una responsabilidad."),
  requirements: z.array(z.object({ value: z.string().min(1, "El requisito no puede estar vacío.") })).min(1, "Añade al menos un requisito."),
  education: z.object({
    level: z.string().min(1, "El nivel académico es requerido."),
    career: z.string().min(1, "La carrera es requerida."),
  }),
  experience: z.string().min(1, "La experiencia es requerida."),
  competencies: z.array(z.object({ value: z.string().min(1, "La competencia no puede estar vacía.") })).min(1, "Añade al menos una competencia."),
  languages: z.array(z.object({ name: z.string().min(1, "El idioma es requerido."), level: z.string().min(1, "El nivel es requerido.") })).min(1, "Añade al menos un idioma."),
  salary: z.object({
    amount: z.string().min(1, "La oferta salarial es requerida."),
    currency: z.enum(["USD", "HNL"]),
    commissions: z.string().optional(),
  }),
  schedule: z.object({
    type: z.enum(["Fixed", "Flexible", "Custom"]),
    entryTime: z.string().optional(),
    exitTime: z.string().optional(),
    details: z.string().optional(),
  }),
  benefits: z.array(z.object({ value: z.string().min(1, "El beneficio no puede estar vacío.") })).min(1, "Añade al menos un beneficio."),
  recruitmentStages: z.array(z.object({ value: z.string().min(1, "La etapa no puede estar vacía.") })).optional(),
  assignedRecruiters: z.array(z.string()).optional(),
  assignedInterviewers: z.array(z.string()).optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

const academicLevels = [
    'Educación Primaria Incompleta',
    'Educación Primaria Completa',
    'Educación Secundaria Incompleta',
    'Educación Secundaria Completa (Bachillerato/Técnico)',
    'Educación Superior - Pregrado Incompleta',
    'Educación Superior - Pregrado Completa (Licenciatura/Ingeniería)',
    'Educación Superior - Postgrado Incompleta (Maestría)',
    'Educación Superior - Postgrado Completa (Maestría)',
    'Educación Superior - Doctorado Incompleto',
    'Educación Superior - Doctorado Completo',
];

export default function EditJobPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const jobRef = useMemoFirebase(() => firestore ? doc(firestore, 'jobs', params.id) : null, [firestore, params.id]);
    const { data: job, isLoading: isLoadingJob } = useDoc<Job>(jobRef);
    
    const companiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'companies') : null, [firestore]);
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<Company>(companiesQuery);
    
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

    const recruiters = React.useMemo(() => users?.filter(user => user.role === 'Reclutador') || [], [users]);
    const interviewers = React.useMemo(() => users?.filter(user => user.role === 'Entrevistador') || [], [users]);

    const [isAutofilling, setIsAutofilling] = React.useState(false);
    const [jobDescriptionToAnalyze, setJobDescriptionToAnalyze] = React.useState('');
    const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
    const [aiPrompt, setAiPrompt] = React.useState('');
    const [coverImage, setCoverImage] = React.useState('');

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        mode: "onChange",
    });

    React.useEffect(() => {
        if (job) {
            const getCoverUrl = (coverId: string) => {
                const image = PlaceHolderImages.find(img => img.id === coverId);
                return image ? image.imageUrl : 'https://picsum.photos/seed/placeholder/1200/400';
            };
            setCoverImage(getCoverUrl(job.coverImage || ''));

            form.reset({
                ...job,
                slug: job.slug || '',
                responsibilities: job.responsibilities.map(value => ({ value })),
                requirements: job.requirements.map(value => ({ value })),
                competencies: job.competencies.map(value => ({ value })),
                languages: job.languages,
                benefits: job.benefits.map(value => ({ value })),
                recruitmentStages: job.recruitmentStages?.map(value => ({ value })) || [],
                assignedRecruiters: job.assignedRecruiters || [],
                assignedInterviewers: job.assignedInterviewers || [],
                salary: {
                    ...job.salary,
                    commissions: job.salary.commissions || '',
                },
                schedule: {
                    ...job.schedule,
                    entryTime: job.schedule.entryTime || '',
                    exitTime: job.schedule.exitTime || '',
                    details: job.schedule.details || '',
                }
            });
            setHasCommissions(!!job.salary?.commissions);
        }
    }, [job, form]);

    if (isLoadingJob || isLoadingCompanies || isLoadingUsers) {
        return <div className="flex h-full w-full justify-center items-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!job) {
        notFound();
    }

    const { fields: respFields, append: appendResp, remove: removeResp } = useFieldArray({ control: form.control, name: "responsibilities" });
    const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({ control: form.control, name: "requirements" });
    const { fields: compFields, append: appendComp, remove: removeComp } = useFieldArray({ control: form.control, name: "competencies" });
    const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: "languages" });
    const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({ control: form.control, name: "benefits" });
    const { fields: stageFields, append: appendStage, remove: removeStage } = useFieldArray({ control: form.control, name: "recruitmentStages" });
    
    const scheduleType = useWatch({ control: form.control, name: "schedule.type" });
    const [hasCommissions, setHasCommissions] = React.useState(!!form.getValues('salary.commissions'));

    const selectedCompanyId = useWatch({ control: form.control, name: "companyId" });
    const selectedCompany = companies?.find(c => c.id === selectedCompanyId);
    
    const companyConfigIncomplete = selectedCompany && (!selectedCompany.departments?.length || !selectedCompany.recruitmentStages?.length);

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formattedValue = value.toLowerCase().replace(/\s+/g, '-');
        form.setValue('slug', formattedValue, { shouldValidate: true });
    };

    
    const handleAutofill = async (description: string) => {
        if (!description.trim()) {
            toast({
                variant: 'destructive',
                title: 'Texto Vacío',
                description: 'Por favor, pega la descripción del puesto o sube un archivo para analizar.',
            });
            return;
        }
        setIsAutofilling(true);
        try {
            const result = await autofillJobDetails({ jobDescription: description });
            
            if (result.title) form.setValue('title', result.title, { shouldValidate: true });
            if (result.description) form.setValue('description', result.description, { shouldValidate: true });
            if (result.experience) form.setValue('experience', result.experience, { shouldValidate: true });
            if (result.education?.level) form.setValue('education.level', result.education.level, { shouldValidate: true });
            if (result.education?.career) form.setValue('education.career', result.education.career, { shouldValidate: true });
            
            if (result.responsibilities && result.responsibilities.length > 0) form.setValue('responsibilities', result.responsibilities.map(r => ({ value: r.value })), { shouldValidate: true });
            if (result.requirements && result.requirements.length > 0) form.setValue('requirements', result.requirements.map(r => ({ value: r.value })), { shouldValidate: true });
            if (result.competencies && result.competencies.length > 0) form.setValue('competencies', result.competencies.map(c => ({ value: c.value })), { shouldValidate: true });
            if (result.languages && result.languages.length > 0) form.setValue('languages', result.languages.map(l => ({ name: l.name, level: l.level })), { shouldValidate: true });
            if (result.benefits && result.benefits.length > 0) form.setValue('benefits', result.benefits.map(b => ({ value: b.value })), { shouldValidate: true });
            
            toast({
                title: 'Formulario Autocompletado',
                description: 'Los campos han sido llenados con la información analizada.',
            });
        } catch (error) {
            console.error('Error autofilling form:', error);
            toast({
                variant: 'destructive',
                title: 'Error de IA',
                description: 'No se pudo analizar la descripción del puesto.',
            });
        } finally {
            setIsAutofilling(false);
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                handleAutofill(text);
            };
            reader.readAsText(file);
        }
    };

    const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setCoverImage(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateImage = async () => {
        if (!aiPrompt) {
            toast({
                variant: 'destructive',
                title: 'Prompt Vacío',
                description: 'Por favor, escribe una descripción para generar la imagen.',
            });
            return;
        }
        setIsGeneratingImage(true);
        try {
            const result = await generateImageFromText({ prompt: aiPrompt });
            setCoverImage(result.imageUrl);
            toast({
                title: 'Imagen Generada',
                description: 'La imagen de portada ha sido actualizada.',
            });
        } catch (error) {
            console.error('Error generating image:', error);
            toast({
                variant: 'destructive',
                title: 'Error de IA',
                description: 'No se pudo generar la imagen.',
            });
        } finally {
            setIsGeneratingImage(false);
        }
    };


    function onSubmit(data: JobFormValues) {
        console.log(data);
        toast({
            title: "Plaza Actualizada",
            description: "Los cambios en la plaza han sido guardados exitosamente.",
        });
        router.push(`/jobs/${job?.id}`);
    }

    return (
        <>
            <DashboardHeader title="Editar Plaza" description="Modifica los detalles de la oferta de trabajo.">
                <Button variant="outline" asChild>
                    <Link href={`/jobs/${job.id}`}>
                        <ArrowLeft className="mr-2" />
                        Cancelar y Volver
                    </Link>
                </Button>
            </DashboardHeader>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Asistente de IA</CardTitle>
                    <CardDescription>
                        Pega el texto de una descripción de puesto o sube un archivo para autocompletar el formulario.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <Textarea 
                            placeholder="Pega aquí la descripción completa del puesto..." 
                            rows={6}
                            value={jobDescriptionToAnalyze}
                            onChange={(e) => setJobDescriptionToAnalyze(e.target.value)}
                        />
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="jd-file" className="text-sm text-muted-foreground">O sube un archivo:</Label>
                                <Input 
                                    id="jd-file" 
                                    type="file"
                                    className="max-w-xs" 
                                    accept=".txt,.md,.pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <Button onClick={() => handleAutofill(jobDescriptionToAnalyze)} disabled={isAutofilling}>
                                {isAutofilling ? <Loader2 className="mr-2 animate-spin"/> : <Wand2 className="mr-2"/>}
                                {isAutofilling ? 'Analizando...' : 'Analizar y Autocompletar'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                            <CardDescription>Configura los detalles principales de la plaza.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label>Imagen de Portada</Label>
                                <Card className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="relative aspect-[16/5] w-full">
                                            {isGeneratingImage ? (
                                                <div className="flex items-center justify-center h-full bg-muted">
                                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : (
                                                <Image 
                                                    src={coverImage}
                                                    alt="Imagen de portada" 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <Label htmlFor="cover-upload" className="mb-2 block">Subir nueva imagen</Label>
                                        <Input id="cover-upload" type="file" onChange={handleCoverFileChange} accept="image/*"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cover-ai-prompt">O generar una con IA</Label>
                                        <div className="flex gap-2">
                                            <Input id="cover-ai-prompt" placeholder="Ej: oficina moderna y luminosa" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
                                            <Button type="button" variant="outline" onClick={handleGenerateImage} disabled={isGeneratingImage}>
                                                {isGeneratingImage ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2"/>}
                                                Generar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título de la Plaza <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input placeholder="Ej: Desarrollador Frontend" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="companyId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            form.setValue('department', '');
                                            form.setValue('location', '');
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Selecciona una empresa" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {companies?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                             {companyConfigIncomplete && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Configuración de Empresa Incompleta</AlertTitle>
                                    <AlertDescription>
                                        Esta empresa no tiene {!selectedCompany?.departments?.length ? 'departamentos' : ''}{!selectedCompany?.departments?.length && !selectedCompany?.recruitmentStages?.length ? ' ni ' : ''}{!selectedCompany?.recruitmentStages?.length ? 'etapas de reclutamiento' : ''} definidos.
                                        <Link href={`/companies/${selectedCompanyId}/edit`} className="font-bold underline ml-1">
                                            Por favor, actualiza la configuración
                                        </Link>
                                         &nbsp;antes de crear una plaza.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>URL Personalizada (Slug)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">
                                            /empleos/
                                        </span>
                                        <Input
                                            placeholder="ej-nombre-plaza"
                                            className="pl-20"
                                            {...field}
                                            onChange={handleSlugChange}
                                            value={field.value ?? ''}
                                        />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Define una URL amigable para esta plaza. Usa solo letras minúsculas, números y guiones.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="department" render={({ field }) => (
                                     <FormItem>
                                        <FormLabel>Departamento <span className="text-destructive">*</span></FormLabel>
                                         <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCompanyId || companyConfigIncomplete}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={!selectedCompanyId ? "Selecciona una empresa primero" : "Selecciona un departamento"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {selectedCompany?.departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="location" render={({ field }) => (
                                     <FormItem>
                                        <FormLabel>Ubicación <span className="text-destructive">*</span></FormLabel>
                                         <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCompanyId || companyConfigIncomplete}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={!selectedCompanyId ? "Selecciona una empresa primero" : "Selecciona una ubicación"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {selectedCompany?.addresses?.map(address => {
                                                     const locationString = `${address.branchName || address.address1}, ${address.city}, ${address.country}`;
                                                     return <SelectItem key={address.id} value={locationString}>{locationString}</SelectItem>
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <FormField control={form.control} name="type" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Contrato <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Full-time">Tiempo Completo</SelectItem>
                                                <SelectItem value="Part-time">Medio Tiempo</SelectItem>
                                                <SelectItem value="Contract">Contrato</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="vacancies" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cupos a Contratar <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <PackagePlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input type="number" placeholder="Ej: 3" className="pl-10" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                           </div>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción de la Plaza <span className="text-destructive">*</span></FormLabel>
                                    <FormControl><Textarea placeholder="Describe el rol, el equipo y la oportunidad." {...field} rows={5} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Equipo de Contratación</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-base font-medium mb-2">Reclutadores Asignados</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Selecciona los reclutadores que tendrán visibilidad sobre esta plaza. Si no se selecciona ninguno, solo los administradores y supervisores tendrán acceso.
                                </p>
                                <FormField
                                    control={form.control}
                                    name="assignedRecruiters"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="space-y-3">
                                            {recruiters.map((recruiter) => (
                                                    <FormItem
                                                        key={recruiter.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                                    >
                                                        <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(recruiter.id)}
                                                            onCheckedChange={(checked) => {
                                                                const currentValue = field.value || [];
                                                                const updatedValue = checked
                                                                    ? [...currentValue, recruiter.id]
                                                                    : currentValue.filter(
                                                                        (value) => value !== recruiter.id
                                                                    );
                                                                field.onChange(updatedValue);
                                                            }}
                                                        />
                                                        </FormControl>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>{recruiter.displayName?.substring(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="grid">
                                                                <FormLabel className="font-medium">{recruiter.displayName}</FormLabel>
                                                                <FormDescription className="text-xs">
                                                                    {recruiter.email}
                                                                </FormDescription>
                                                            </div>
                                                        </div>
                                                    </FormItem>
                                            ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-base font-medium mb-2">Entrevistadores Asignados</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Selecciona los entrevistadores que participarán en el proceso de selección.
                                </p>
                                <FormField
                                    control={form.control}
                                    name="assignedInterviewers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="space-y-3">
                                            {interviewers.map((interviewer) => (
                                                    <FormItem
                                                        key={interviewer.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                                    >
                                                        <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(interviewer.id)}
                                                            onCheckedChange={(checked) => {
                                                                const currentValue = field.value || [];
                                                                const updatedValue = checked
                                                                    ? [...currentValue, interviewer.id]
                                                                    : currentValue.filter(
                                                                        (value) => value !== interviewer.id
                                                                    );
                                                                field.onChange(updatedValue);
                                                            }}
                                                        />
                                                        </FormControl>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>{interviewer.displayName?.substring(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="grid">
                                                                <FormLabel className="font-medium">{interviewer.displayName}</FormLabel>
                                                                <FormDescription className="text-xs">
                                                                    {interviewer.email}
                                                                </FormDescription>
                                                            </div>
                                                        </div>
                                                    </FormItem>
                                            ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Compensación y Horario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <Label>Oferta Salarial</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                     <FormField control={form.control} name="salary.amount" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monto <span className="text-destructive">*</span></FormLabel>
                                            <FormControl><Input placeholder="Ej: 50,000 - 70,000" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="salary.currency" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Moneda <span className="text-destructive">*</span></FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Selecciona una moneda" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="HNL">HNL</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="hasCommissions" 
                                            checked={hasCommissions} 
                                            onCheckedChange={(checked) => setHasCommissions(!!checked)}
                                        />
                                        <Label htmlFor="hasCommissions" className="font-normal">Aplica a comisiones</Label>
                                    </div>
                                    {hasCommissions && (
                                        <FormField control={form.control} name="salary.commissions" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Detalles de Comisiones</FormLabel>
                                                <FormControl><Input placeholder="Ej: 10% sobre ventas" {...field} value={field.value ?? ''} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    )}
                                </div>
                            </div>
                            <Separator/>
                            <div>
                                <Label>Horario de Trabajo</Label>
                                <div className="mt-2">
                                    <FormField control={form.control} name="schedule.type" render={({ field }) => (
                                        <FormItem>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Selecciona un tipo de horario" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Fixed">Fijo</SelectItem>
                                                    <SelectItem value="Flexible">Flexible</SelectItem>
                                                    <SelectItem value="Custom">Personalizado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                {scheduleType === 'Fixed' && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <FormField control={form.control} name="schedule.entryTime" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hora de Entrada</FormLabel>
                                                <FormControl><Input type="time" {...field} value={field.value ?? ''} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name="schedule.exitTime" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Hora de Salida</FormLabel>
                                                <FormControl><Input type="time" {...field} value={field.value ?? ''}/></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                )}
                                {(scheduleType === 'Flexible' || scheduleType === 'Custom') && (
                                     <FormField control={form.control} name="schedule.details" render={({ field }) => (
                                        <FormItem className="mt-4">
                                            <FormLabel>Detalles del Horario</FormLabel>
                                            <FormControl><Textarea placeholder="Describe los detalles del horario flexible o personalizado." {...field} value={field.value ?? ''} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Requisitos y Educación</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="education.level" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nivel Académico <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un nivel académico" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {academicLevels.map(level => (
                                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="education.career" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carrera <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input placeholder="Ej: Ingeniería en Informática" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                             <FormField control={form.control} name="experience" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experiencia Requerida <span className="text-destructive">*</span></FormLabel>
                                    <FormControl><Input placeholder="Ej: 5+ años en desarrollo frontend" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Habilidades y Responsabilidades</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label>Responsabilidades <span className="text-destructive">*</span></Label>
                                {respFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`responsibilities.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input {...field} /></FormControl>
                                                <Button type="button" variant="outline" size="icon" onClick={() => removeResp(index)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendResp({ value: "" })}>Añadir Responsabilidad</Button>
                            </div>
                             <Separator />
                             <div>
                                <Label>Requisitos de la Plaza <span className="text-destructive">*</span></Label>
                                {reqFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`requirements.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input {...field} /></FormControl>
                                                <Button type="button" variant="outline" size="icon" onClick={() => removeReq(index)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendReq({ value: "" })}>Añadir Requisito</Button>
                            </div>
                             <Separator />
                            <div>
                                <Label>Competencias <span className="text-destructive">*</span></Label>
                                {compFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`competencies.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input {...field} /></FormControl>
                                                <Button type="button" variant="outline" size="icon" onClick={() => removeComp(index)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendComp({ value: "" })}>Añadir Competencia</Button>
                            </div>
                            <Separator />
                            <div>
                                <Label>Idiomas <span className="text-destructive">*</span></Label>
                                {langFields.map((field, index) => (
                                     <div key={field.id} className="flex items-start gap-2 mt-2">
                                        <FormField control={form.control} name={`languages.${index}.name`} render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl><Input placeholder="Idioma" {...field} /></FormControl>
                                                 <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`languages.${index}.level`} render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl><Input placeholder="Nivel" {...field} /></FormControl>
                                                 <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <Button type="button" variant="outline" size="icon" onClick={() => removeLang(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendLang({ name: "", level: "" })}>Añadir Idioma</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Beneficios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label>Beneficios Ofrecidos <span className="text-destructive">*</span></Label>
                                {benefitFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`benefits.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input placeholder="Ej: Seguro médico" {...field} /></FormControl>
                                                <Button type="button" variant="outline" size="icon" onClick={() => removeBenefit(index)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendBenefit({ value: "" })}>Añadir Beneficio</Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                     <Card>
                        <CardHeader>
                            <CardTitle>Etapas del Proceso de Reclutamiento</CardTitle>
                            <CardDescription>
                                Define etapas específicas para esta plaza. Si se deja en blanco, se usarán las etapas generales de la empresa.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                {stageFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`recruitmentStages.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input placeholder="Ej: Entrevista Técnica" {...field} /></FormControl>
                                                <Button type="button" variant="outline" size="icon" onClick={() => removeStage(index)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendStage({ value: "" })}>Añadir Etapa</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild><Link href={`/jobs`}>Cancelar</Link></Button>
                        <Button type="submit" disabled={companyConfigIncomplete}>Guardar Cambios</Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
