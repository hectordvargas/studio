

'use client';

import { notFound, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { Candidate } from "@/lib/data";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const candidateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Correo electrónico inválido."),
  jobTitle: z.string().min(1, "El título del puesto es requerido."),
  avatar: z.string().optional(),
  profile: z.object({
    summary: z.string().min(1, "El resumen es requerido."),
    skills: z.array(z.object({ value: z.string().min(1, "La habilidad no puede estar vacía.") })),
    experience: z.array(z.object({
      title: z.string().min(1, "El título es requerido."),
      company: z.string().min(1, "La empresa es requerida."),
      duration: z.string().min(1, "La duración es requerida."),
    })),
  }),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

export default function EditCandidatePage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const candidateRef = useMemoFirebase(() => firestore ? doc(firestore, 'candidates', params.id) : null, [firestore, params.id]);
    const { data: candidate, isLoading: isLoadingCandidate } = useDoc<Candidate>(candidateRef);
    
    const [avatarPreview, setAvatarPreview] = React.useState<string | undefined>('');

    const form = useForm<CandidateFormValues>({
        resolver: zodResolver(candidateSchema),
        mode: "onChange",
    });

    React.useEffect(() => {
        if (candidate) {
            form.reset({
                name: candidate.name,
                email: candidate.email,
                jobTitle: candidate.jobTitle,
                avatar: candidate.avatar || '',
                profile: {
                    summary: candidate.profile?.summary || '',
                    skills: candidate.profile?.skills?.map(value => ({ value })) || [],
                    experience: candidate.profile?.experience || [],
                },
            });
            setAvatarPreview(candidate.avatar);
        }
    }, [candidate, form]);

    
    const getAvatarUrl = (avatarId: string | undefined) => {
        if (!avatarId) return 'https://picsum.photos/seed/placeholder/100/100';
        const image = PlaceHolderImages.find(img => img.id === avatarId);
        return image ? image.imageUrl : `https://picsum.photos/seed/${avatarId}/100/100`;
    }

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: "profile.skills" });
    const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "profile.experience" });

    function onSubmit(data: CandidateFormValues) {
        console.log("Saving data (simulated): ", data);
        toast({
            title: "Perfil Actualizado",
            description: `Los datos de ${data.name} han sido guardados (simulado).`,
        });
        router.push(`/candidates/${params.id}`);
    }
    
    if (isLoadingCandidate) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    if (!candidate) {
        notFound();
    }

    return (
        <>
            <DashboardHeader title={`Editar Perfil: ${candidate.name}`}>
                <Button variant="outline" asChild>
                    <Link href={`/candidates/${candidate.id}`}>
                        <ArrowLeft className="mr-2" />
                        Cancelar y Volver
                    </Link>
                </Button>
            </DashboardHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>Modifica los datos básicos del candidato.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={getAvatarUrl(avatarPreview)} />
                                    <AvatarFallback>{candidate.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <FormField control={form.control} name="avatar" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>ID de Avatar</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: candidate-1" {...field} value={field.value ?? ''} onChange={(e) => {
                                                field.onChange(e);
                                                setAvatarPreview(e.target.value);
                                            }}/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Completo <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input type="email" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="jobTitle" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Puesto Actual / Puesto al que aplica <span className="text-destructive">*</span></FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Perfil Profesional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <FormField control={form.control} name="profile.summary" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resumen Profesional <span className="text-destructive">*</span></FormLabel>
                                    <FormControl><Textarea rows={5} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <Separator />
                            <div>
                                <Label>Habilidades</Label>
                                {skillFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`profile.skills.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input placeholder="Ej: React" {...field} /></FormControl>
                                                <Button type="button" variant="outline" size="icon" onClick={() => removeSkill(index)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSkill({ value: "" })}>Añadir Habilidad</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Experiencia Laboral</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {expFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                     <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeExp(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    <FormField control={form.control} name={`profile.experience.${index}.title`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Puesto <span className="text-destructive">*</span></FormLabel>
                                            <FormControl><Input placeholder="Ej: Desarrollador Frontend" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`profile.experience.${index}.company`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Empresa <span className="text-destructive">*</span></FormLabel>
                                            <FormControl><Input placeholder="Ej: TechSolutions Inc." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`profile.experience.${index}.duration`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duración <span className="text-destructive">*</span></FormLabel>
                                            <FormControl><Input placeholder="Ej: 2020 - Presente" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendExp({ title: "", company: "", duration: "" })}>Añadir Experiencia</Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild><Link href={`/candidates/${params.id}`}>Cancelar</Link></Button>
                        <Button type="submit">Guardar Cambios</Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
