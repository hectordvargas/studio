
'use client';
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { psychometricTests, technicalTests } from "@/lib/data";

export default function EvaluationsPage() {
  return (
    <div>
      <DashboardHeader
        title="Catálogo de Evaluaciones"
        description="Gestiona las evaluaciones psicométricas, técnicas y de idiomas disponibles."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Evaluación
        </Button>
      </DashboardHeader>
      <Tabs defaultValue="psychometric">
        <TabsList>
          <TabsTrigger value="psychometric">Evaluaciones Psicométricas</TabsTrigger>
          <TabsTrigger value="technical">Evaluaciones Técnicas</TabsTrigger>
          <TabsTrigger value="languages">Evaluaciones de Idiomas</TabsTrigger>
        </TabsList>
        <TabsContent value="psychometric" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {psychometricTests.map(test => (
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
        </TabsContent>
        <TabsContent value="technical" className="mt-4">
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {technicalTests.map(test => (
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
