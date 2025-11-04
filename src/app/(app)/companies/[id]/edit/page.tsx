

'use client';

import React, { useMemo } from "react";
import Link from "next/link";
import { notFound, useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2, Loader2, Globe, Mail, Phone, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/lib/data";


const addressSchema = z.object({
    id: z.number(),
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
  departments: z.array(z.object({ value: z.string().min(1, "El departamento no puede estar vacío.") })).min(1, "Debe añadir al menos un departamento."),
  recruitmentStages: z.array(z.object({ value: z.string().min(1, "La etapa no puede estar vacía.") })).min(1, "Debe añadir al menos una etapa de reclutamiento."),
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

const defaultCompanyValues: Partial<CompanyFormValues> = {
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
        customFooter: "",
    },
};


export default function EditCompanyPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const companyRef = useMemoFirebase(() => firestore ? doc(firestore, 'companies', params.id) : null, [firestore, params.id]);
    const { data: company, isLoading: isLoadingCompany } = useDoc<Company>(companyRef);

    const [isSaving, setIsSaving] = React.useState(false);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: defaultCompanyValues,
        mode: "onChange",
    });

    React.useEffect(() => {
        if (company) {
            form.reset({
                name: company.name,
                description: company.description,
                logo: company.logo || '',
                website: company.website || '',
                email: company.email || '',
                phone: company.phone || '',
                foundedDate: company.foundedDate || '',
                departments: company.departments.map(value => ({ value })),
                recruitmentStages: company.recruitmentStages.map(value => ({ value })),
                addresses: company.addresses.map(addr => ({ 
                    ...addr, 
                    id: addr.id || Math.random(), 
                    branchName: addr.branchName ?? '', 
                    address2: addr.address2 ?? '', 
                    postalCode: addr.postalCode ?? '' 
                })),
                branding: {
                    enableCustomFooter: company.branding?.enableCustomFooter || false,
                    customFooter: company.branding?.customFooter || '',
                },
            });
            setLogoPreview(company.logo);
        }
    }, [company, form]);

    const { fields: deptFields, append: appendDept, remove: removeDept } = useFieldArray({ control: form.control, name: "departments" });
    const { fields: stageFields, append: appendStage, remove: removeStage } = useFieldArray({ control: form.control, name: "recruitmentStages" });
    const { fields: addressFields, append: appendAddress, update: updateAddress, remove: removeAddress } = useFieldArray({ control: form.control, name: "addresses" });
    
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
    
    const handleSetAsMain = (selectedIndex: number) => {
        const currentAddresses = form.getValues('addresses');
        const newAddresses = currentAddresses.map((address, index) => {
            if (index === selectedIndex) {
                return { ...address, type: 'Sede Principal' as const };
            }
            if (address.type === 'Sede Principal') {
                return { ...address, type: 'Filial' as const };
            }
            return address;
        });
        form.setValue('addresses', newAddresses, { shouldValidate: true });
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
        if (!companyRef) return;
        setIsSaving(true);
        
        const companyDataToSave = {
            ...data,
            jobCount: company?.jobCount || 0,
            departments: data.departments.map(d => d.value),
            recruitmentStages: data.recruitmentStages.map(s => s.value),
        };
        
        try {
            await setDoc(companyRef, companyDataToSave, { merge: true });

            toast({
                title: "Empresa Actualizada",
                description: `Los cambios para ${data.name} se han guardado correctamente.`
            });
            router.push(`/companies/${params.id}`);

        } catch (error) {
            console.error("Error saving company: ", error);
            toast({
                variant: "destructive",
                title: "Error al Guardar",
                description: "No se pudieron guardar los cambios en la empresa."
            });
        } finally {
            setIsSaving(false);
        }
    }
    
    if (isLoadingCompany) {
        return <div className="flex h-full w-full justify-center items-center"><Loader2 className="animate-spin" /></div>;
    }
    
    if (!company) {
        return notFound();
    }
    
    return (
        <>
            <DashboardHeader
                title={`Editar: ${company.name}`}
                description="Modifica el perfil y la configuración de la empresa."
            >
                <Button variant="outline" asChild>
                    <Link href={`/companies/${company.id}`}>
                        <ArrowLeft className="mr-2" />
                        Cancelar y Volver
                    </Link>
                </Button>
            </DashboardHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Perfil de la Empresa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={logoPreview || undefined} />
                                    <AvatarFallback>{company.name.substring(0, 2)}</AvatarFallback>
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
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Empresa <span className="text-destructive">*</span></FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl><Input {...field} value={field.value ?? ''} placeholder="contacto@empresa.com" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl><Input {...field} value={field.value ?? ''} placeholder="+1 555-123-4567" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="website" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sitio Web</FormLabel>
                                        <FormControl><Input {...field} value={field.value ?? ''} placeholder="https://www.empresa.com" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="foundedDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Año de Fundación</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value ?? ''} placeholder="2024" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción <span className="text-destructive">*</span></FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
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
                                        <Badge>{field.type}</Badge>
                                        <div className="flex items-center gap-1">
                                            {field.type === 'Filial' && (
                                                 <Button type="button" variant="outline" size="sm" onClick={() => handleSetAsMain(index)}>
                                                    Hacer Principal
                                                 </Button>
                                            )}
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAddress(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                    <FormField control={form.control} name={`addresses.${index}.branchName`} render={({ field }) => (
                                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`addresses.${index}.address1`} render={({ field }) => (
                                        <FormItem><FormLabel>Dirección <span className="text-destructive">*</span></FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
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
                        <CardHeader><CardTitle>Configuración Interna</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label>Departamentos <span className="text-destructive">*</span></Label>
                                <p className="text-sm text-muted-foreground mb-2">Define los departamentos internos de la empresa.</p>
                                <FormMessage>{form.formState.errors.departments?.message}</FormMessage>
                                {deptFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`departments.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input {...field} /></FormControl>
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
                                <Label>Etapas del Proceso de Reclutamiento <span className="text-destructive">*</span></Label>
                                <p className="text-sm text-muted-foreground mb-2">Define las etapas generales que seguirán las plazas de esta empresa.</p>
                                <FormMessage>{form.formState.errors.recruitmentStages?.message}</FormMessage>
                                {stageFields.map((field, index) => (
                                    <FormField key={field.id} control={form.control} name={`recruitmentStages.${index}.value`} render={({ field }) => (
                                        <FormItem className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <FormControl><Input {...field} /></FormControl>
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
                        <Button variant="outline" asChild><Link href={`/companies/${company.id}`}>Cancelar</Link></Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
