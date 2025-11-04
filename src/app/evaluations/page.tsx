
'use client';
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, CheckCircle, LayoutGrid, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { psychometricTestCategories, technicalTests, PsychometricTest, TechnicalTest } from "@/lib/data";
import { cn } from "@/lib/utils";

type ViewMode = 'card' | 'list';

function PsychometricCardView({ categories }: { categories: typeof psychometricTestCategories }) {
    return (
        <div className="space-y-8">
        {categories.map((category) => (
          <section key={category.category}>
            <h2 className="mb-4 text-xl font-semibold">{category.category}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.tests.map(test => (
                  <Card key={test.title} className="flex flex-col">
                      <CardHeader>
                          <CardTitle>{test.title}</CardTitle>
                          <CardDescription>{test.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                         <div className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="mr-2 h-4 w-4 text-primary"/>
                          <span>{test.items} reactivos</span>
                         </div>
                         <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4 text-primary"/>
                          <span>{test.duration}</span>
                         </div>
                         <div>
                          <h4 className="mb-2 font-semibold">Áreas evaluadas:</h4>
                          <div className="flex flex-wrap gap-2">
                              {test.areas.map(area => <Badge key={area} variant="secondary">{area}</Badge>)}
                          </div>
                         </div>
                      </CardContent>
                      <CardFooter>
                          <Button variant="outline">Ver Detalles</Button>
                      </CardFooter>
                  </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
}

function PsychometricListView({ categories }: { categories: typeof psychometricTestCategories }) {
    const allTests = categories.flatMap(cat => cat.tests.map(test => ({...test, category: cat.category})));
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Título de la Prueba</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Reactivos</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allTests.map(test => (
                        <TableRow key={test.title}>
                            <TableCell className="font-medium">{test.title}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{test.category}</Badge>
                            </TableCell>
                            <TableCell>{test.items}</TableCell>
                            <TableCell>{test.duration}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">Ver Detalles</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}


function TechnicalCardView({ tests }: { tests: TechnicalTest[] }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tests.map(test => (
                <Card key={test.title} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{test.title}</CardTitle>
                        <CardDescription>{test.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                       <p className="text-sm font-semibold">Nivel: <span className="font-normal text-muted-foreground">{test.level}</span></p>
                       <div>
                         <h4 className="mb-2 font-semibold">Habilidades evaluadas:</h4>
                         <div className="flex flex-wrap gap-2">
                          {test.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                         </div>
                       </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline">Ver Detalles</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}


function TechnicalListView({ tests }: { tests: TechnicalTest[] }) {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Título de la Prueba</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Habilidades</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tests.map(test => (
                        <TableRow key={test.title}>
                            <TableCell className="font-medium">{test.title}</TableCell>
                            <TableCell>{test.level}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {test.skills.map(skill => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">Ver Detalles</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}


export default function EvaluationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  return (
    <div>
      <DashboardHeader
        title="Catálogo de Evaluaciones"
        description="Gestiona las evaluaciones psicométricas, técnicas y de idiomas disponibles."
      >
        <div className="flex items-center gap-2">
            <div className="hidden md:flex">
                <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')}>
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                    <List className="h-4 w-4" />
                </Button>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Evaluación
            </Button>
        </div>
      </DashboardHeader>
      <Tabs defaultValue="psychometric">
        <TabsList>
          <TabsTrigger value="psychometric">Evaluaciones Psicométricas</TabsTrigger>
          <TabsTrigger value="technical">Evaluaciones Técnicas</TabsTrigger>
          <TabsTrigger value="languages">Evaluaciones de Idiomas</TabsTrigger>
        </TabsList>

        <TabsContent value="psychometric" className="mt-4">
            {viewMode === 'card' ? 
                <PsychometricCardView categories={psychometricTestCategories} /> : 
                <PsychometricListView categories={psychometricTestCategories} />
            }
        </TabsContent>

        <TabsContent value="technical" className="mt-4">
           {viewMode === 'card' ? 
                <TechnicalCardView tests={technicalTests} /> :
                <TechnicalListView tests={technicalTests} />
           }
        </TabsContent>
        
         <TabsContent value="languages" className="p-4 border rounded-md mt-4">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold">Próximamente</h3>
            <p className="text-muted-foreground mt-2">Las evaluaciones de idiomas estarán disponibles en una futura actualización.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
