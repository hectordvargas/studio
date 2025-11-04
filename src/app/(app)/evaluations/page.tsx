
'use client';

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, PlayCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { psychometricCategories, technicalTests } from "@/lib/evaluations-data";
import { useTranslation } from "@/app/layout";


export default function EvaluationsPage() {
    const { t } = useTranslation();
    const languageTestsCategory = psychometricCategories.find(category => category.name === 'Pruebas de Idiomas');
    const otherPsychometricCategories = psychometricCategories.filter(category => category.name !== 'Pruebas de Idiomas');

    return (
        <>
            <DashboardHeader
                title={t('evaluations.title')}
                description={t('evaluations.description')}
            >
                <Button>
                    <PlusCircle className="mr-2" />
                    {t('evaluations.addEvaluation')}
                </Button>
            </DashboardHeader>
            <Tabs defaultValue="psychometric">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="psychometric">{t('evaluations.tabs.psychometric')}</TabsTrigger>
                    <TabsTrigger value="technical">{t('evaluations.tabs.technical')}</TabsTrigger>
                    <TabsTrigger value="languages">{t('evaluations.tabs.languages')}</TabsTrigger>
                    <TabsTrigger value="vocational">Evaluacion Vocacional</TabsTrigger>
                </TabsList>
                <TabsContent value="psychometric">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('evaluations.psychometric.title')}</CardTitle>
                            <CardDescription>{t('evaluations.psychometric.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {otherPsychometricCategories.map(category => (
                                <div key={category.name}>
                                    <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
                                    <Accordion type="single" collapsible className="w-full">
                                        {category.tests.map((test) => (
                                            <AccordionItem value={test.id} key={test.id}>
                                                <AccordionTrigger>
                                                    <div className="flex justify-between items-center w-full pr-4">
                                                        <div className="text-left">
                                                            <p className="font-semibold">{test.name}</p>
                                                            <p className="text-sm text-muted-foreground">{test.type} • {test.duration}</p>
                                                        </div>
                                                        <Badge variant="secondary">{test.questions.length} {t('evaluations.items')}</Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-4">
                                                    <p className="text-muted-foreground">{test.description}</p>
                                                    <Separator/>
                                                     <div>
                                                        <h4 className="font-semibold mb-2">{t('evaluations.evaluatedFactors')}</h4>
                                                        <p className="text-sm text-muted-foreground">{test.factors}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold mb-2">{t('evaluations.organizationalLevel')}</h4>
                                                            <p className="text-sm text-muted-foreground">{test.organizationalLevel}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-2">{t('evaluations.educationLevel')}</h4>
                                                            <p className="text-sm text-muted-foreground">{test.educationLevel}</p>
                                                        </div>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex items-center justify-between">
                                                        <Button asChild>
                                                            <Link href={`/evaluations/${test.id}`}>
                                                                <PlayCircle className="mr-2"/>
                                                                {t('evaluations.tryEvaluation')}
                                                            </Link>
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Abrir menú</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                <DropdownMenuItem><Edit className="mr-2"/>Editar</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Eliminar</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                    <Separator className="my-8" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="technical">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('evaluations.technical.title')}</CardTitle>
                            <CardDescription>{t('evaluations.technical.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="single" collapsible className="w-full">
                                {technicalTests.map((test) => (
                                    <AccordionItem value={test.id} key={test.id}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between items-center w-full pr-4">
                                                <div className="text-left">
                                                    <p className="font-semibold">{test.name}</p>
                                                    <p className="text-sm text-muted-foreground">{test.type} • {test.duration}</p>
                                                </div>
                                                <Badge variant="secondary">{test.questions.length} {t('evaluations.items')}</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <p className="text-muted-foreground">{test.description}</p>
                                            <Separator/>
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('evaluations.evaluationCriteria')}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {test.evaluationCriteria.map(criterion => <Badge key={criterion} variant="outline">{criterion}</Badge>)}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">{t('evaluations.sampleItems')}</h4>
                                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                                    {test.questions.slice(0, 2).map(q => <li key={q.id}>{q.text}</li>)}
                                                </ul>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <Button asChild>
                                                    <Link href={`/evaluations/${test.id}`}>
                                                        <PlayCircle className="mr-2"/>
                                                        {t('evaluations.tryEvaluation')}
                                                    </Link>
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem><Edit className="mr-2"/>Editar</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Eliminar</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="languages">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('evaluations.languages.title')}</CardTitle>
                            <CardDescription>{t('evaluations.languages.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {languageTestsCategory ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {languageTestsCategory.tests.map((test) => (
                                        <AccordionItem value={test.id} key={test.id}>
                                            <AccordionTrigger>
                                                <div className="flex justify-between items-center w-full pr-4">
                                                    <div className="text-left">
                                                        <p className="font-semibold">{test.name}</p>
                                                        <p className="text-sm text-muted-foreground">{test.type} • {test.duration}</p>
                                                    </div>
                                                    <Badge variant="secondary">{test.questions.length} {t('evaluations.items')}</Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4">
                                                <p className="text-muted-foreground">{test.description}</p>
                                                <Separator/>
                                                <div>
                                                    <h4 className="font-semibold mb-2">{t('evaluations.evaluatedFactors')}</h4>
                                                    <p className="text-sm text-muted-foreground">{test.factors}</p>
                                                </div>
                                                <Separator />
                                                <div className="flex items-center justify-between">
                                                    <Button asChild>
                                                        <Link href={`/evaluations/${test.id}`}>
                                                            <PlayCircle className="mr-2"/>
                                                            {t('evaluations.tryEvaluation')}
                                                        </Link>
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Abrir menú</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuItem><Edit className="mr-2"/>Editar</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>Eliminar</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">{t('evaluations.noLanguageTests')}</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="vocational">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluacion Vocacional</CardTitle>
                            <CardDescription>Pruebas para orientar la vocación profesional.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center">No hay evaluaciones vocacionales disponibles.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    );
}

    
