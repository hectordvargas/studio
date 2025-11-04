'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestore, FirestorePermissionError } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const addressSchema = z.object({
    id: z.number().optional(),
    branchName: z.string().optional(),
    address1: z.string().min(1, "La dirección es requerida."),
    address2: z.string().optional(),
    city: z.string().min(1, "La ciudad es requerida."),
    state: z.string().min(1, "El estado/provincia es requerido."),
    country: z.string().min(1, "El país es requerido."),
    postalCode: z.string().optional(),
    type: z.enum(['Sede Principal', 'Filial'])
});

const companySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido."),
  description: z.string().min(1, "La descripción es requerida."),
  logo: z.string().optional(),
  website: z.string().url("URL inválida").or(z.literal('')).optional(),
  email: z.string().email("Correo electrónico inválido.").or(z.literal('')).optional(),
  phone: z.string().optional(),
  foundedDate: z.string().optional(),
  departments: z.array(z.object({ value: z.string().min(1, "El departamento no puede estar vacío.") })).optional(),
  recruitmentStages: z.array(z.object({ value: z.string().min(1, "La etapa no puede estar vacía.") })).optional(),
  addresses: z.array(addressSchema).min(1, "Debe añadir al menos una dirección.")
    .refine(addresses => addresses.filter(a => a.type === 'Sede Principal').length === 1, {
        message: "Debe haber exactamente una Sede Principal.",
    }),
  branding: z.object({
    enableCustomFooter: z.boolean().default(false),
    customFooter: z.string().optional(),
  }),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const defaultValues: Partial<CompanyFormValues> = {
    name: "",
    description: "",
    logo: "",
    website: "",
    email: "",
    phone: "",
    foundedDate: "",
    departments: [],
    recruitmentStages: [],
    addresses: [],
    branding: {
        enableCustomFooter: false,
        customFooter: '',
    },
};


export default function NewCompanyPage() {
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSaving, setIsSaving] = React.useState(false);

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues,
        mode: "onChange",
    });

    const { fields: deptFields, append: appendDept, remove: removeDept } = useFieldArray({ control: form.control, name: "departments" });
    const { fields: stageFields, append: appendStage, remove: removeStage } = useFieldArray({ control: form.control, name: "recruitmentStages" });
    const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({ control: form.control, name: "addresses" });
    
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

    const hasMainOffice = (form.watch('addresses') || []).some(a => a.type === 'Sede Principal');

    const handleAddAddress = (type: 'Sede Principal' | 'Filial') => {
        if (type === 'Sede Principal' && hasMainOffice) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Solo puede haber una sede principal.'
            });
            return;
        }
        appendAddress({
            id: Date.now(),
            branchName: type === 'Sede Principal' ? 'Sede Principal' : '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            type: type
        });
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setLogoPreview(result);
                form.setValue('logo', result, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    async function onSubmit(data: CompanyFormValues) {
        if (!firestore) return;
        setIsSaving(true);
        
        const companyDataToSave = {
            ...data,
            jobCount: 0,
            departments: data.departments?.map(d => d.value) || [],
            recruitmentStages: data.recruitmentStages?.map(s => s.value) || [],
        };
        
        try {
            const companiesCollection = collection(firestore, 'companies');
            await addDoc(companiesCollection, companyDataToSave);
            
            toast({
                title: "Empresa Creada",
                description: `La empresa ${data.name} ha sido creada exitosamente.`
            });
            router.push('/companies');

        } catch (error) {
            console.error("Error creating company:", error);
             const contextualError = new FirestorePermissionError({
                path: collection(firestore, 'companies').path,
                operation: 'create',
                requestResourceData: data,
            });
            throw contextualError;
        } finally {
            setIsSaving(false);
        }
    }
    
    return (
        <>
            <DashboardHeader
                title="Crear Nueva Empresa"
                description="Añade un nuevo perfil de empresa al sistema."
            >
                <Button variant="outline" asChild>
                    <Link href="/companies">
                        <ArrowLeft className="mr-2" />
                        Volver a Empresas
                    </Link>
                </Button>
            </DashboardHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Perfil de la Empresa</CardTitle>
                            <CardDescription>
                                Completa la información y configuración de la nueva empresa.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={logoPreview || undefined} />
                                    <AvatarFallback>Logo</AvatarFallback>
                                </Avatar>
                                <div>
                                    <Label htmlFor="logo">Logo de la empresa</Label>
                                    <Input 
                                        id="logo" 
                                        type="file" 
                                        className="w-full max-w-xs" 
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF hasta 5MB.</p>
                                </div>
                            </div>

                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de la Empresa <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input placeholder="Ej: Mi Empresa S.A." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl><Input type="email" placeholder="contacto@empresa.com" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl><Input placeholder="+1 555-123-4567" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="website" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sitio Web</FormLabel>
                                        <FormControl><Input placeholder="https://www.empresa.com" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="foundedDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año de Fundación</FormLabel>
                                        <FormControl><Input type="number" placeholder="2024" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>

                             <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Textarea placeholder="Describe la empresa" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Direcciones</CardTitle>
                            <FormMessage>{form.formState.errors.addresses?.message || form.formState.errors.addresses?.root?.message}</FormMessage>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {addressFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge>{field.type}</Badge>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAddress(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                    <FormField control={form.control} name={`addresses.${index}.branchName`} render={({ field }) => (
                                        <FormItem><FormLabel>Nombre (Ej: Oficinas Centrales)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`addresses.${index}.address1`} render={({ field }) => (
                                        <FormItem><FormLabel>Dirección <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`addresses.${index}.address2`} render={({ field }) => (
                                        <FormItem><FormLabel>Referencia / PO Box</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                     <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`addresses.${index}.city`} render={({ field }) => (
                                            <FormItem><FormLabel>Ciudad <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`addresses.${index}.state`} render={({ field }) => (
                                            <FormItem><FormLabel>Estado/Provincia <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`addresses.${index}.country`} render={({ field }) => (
                                            <FormItem><FormLabel>País <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`addresses.${index}.postalCode`} render={({ field }) => (
                                            <FormItem><FormLabel>Código Postal</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                </div>
                            ))}
                             <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" disabled={hasMainOffice} onClick={() => handleAddAddress('Sede Principal')}>Añadir Sede Principal</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddAddress('Filial')}>Añadir Filial</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración Interna</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label>Departamentos</Label>
                                <p className="text-sm text-muted-foreground mb-2">Define los departamentos internos de la empresa.</p>
                                <FormMessage>{form.formState.errors.departments?.message}</FormMessage>
                                {deptFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`departments.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input placeholder="Ej: Ventas" {...field} /></FormControl>
                                                <Button type="button" variant="outline" size="icon" onClick={() => removeDept(index)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendDept({ value: "" })}>Añadir Departamento</Button>
                            </div>
                            <Separator />
                             <div>
                                <Label>Etapas del Proceso de Reclutamiento</Label>
                                <p className="text-sm text-muted-foreground mb-2">Define las etapas generales que seguirán las plazas de esta empresa.</p>
                                <FormMessage>{form.formState.errors.recruitmentStages?.message}</FormMessage>
                                {stageFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`recruitmentStages.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input placeholder="Ej: Entrevista con RH" {...field} /></FormControl>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Portal Público</CardTitle>
                            <CardDescription>
                                Personaliza la apariencia de la empresa en el portal de empleos público.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="branding.enableCustomFooter"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Habilitar pie de página personalizado</FormLabel>
                                            <FormDescription>
                                                Reemplaza el pie de página por defecto en la página pública de esta empresa.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="branding.customFooter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contenido del Pie de Página Personalizado</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={8}
                                                placeholder="Escribe aquí el contenido HTML o texto plano para tu pie de página..."
                                                {...field}
                                                value={field.value ?? ""}
                                                disabled={!form.watch('branding.enableCustomFooter')}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" asChild><Link href="/companies">Cancelar</Link></Button>
                        <Button type="submit" disabled={isSaving}>
                             {isSaving && <Loader2 className="mr-2 animate-spin" />}
                            Guardar Empresa
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
