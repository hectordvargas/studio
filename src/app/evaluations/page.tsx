'use client';
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const psychometricTests = [
  {
    title: "Test de Personalidad PPA",
    description: "Análisis de Perfil Personal para evaluar comportamiento en el entorno laboral.",
    items: 120,
    factors: ["Dominancia", "Influencia", "Estabilidad", "Cumplimiento"]
  },
  {
    title: "Test de Inteligencia Emocional TEI",
    description: "Mide la capacidad para percibir, asimilar, comprender y regular las emociones.",
    items: 153,
    factors: ["Autoconciencia", "Autocontrol", "Motivación", "Empatía", "Habilidad Social"]
  }
];

const technicalTests = [
    {
        title: "Prueba de Habilidad en React",
        description: "Evalúa el conocimiento en React, Hooks, Context API y patrones de diseño.",
        level: "Senior",
        skills: ["React", "JavaScript", "CSS", "Testing"]
    },
    {
        title: "Desafío de Algoritmia",
        description: "Mide la capacidad de resolución de problemas complejos y eficiencia de código.",
        level: "Intermedio/Avanzado",
        skills: ["Algoritmos", "Estructura de Datos", "Complejidad"]
    }
]

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
                    <Card key={test.title}>
                        <CardHeader>
                            <CardTitle>{test.title}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground mb-2">{test.items} reactivos</p>
                           <div className="flex flex-wrap gap-2">
                            {test.factors.map(factor => <Badge key={factor} variant="secondary">{factor}</Badge>)}
                           </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm">Ver Detalles</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="technical" className="mt-4">
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {technicalTests.map(test => (
                    <Card key={test.title}>
                        <CardHeader>
                            <CardTitle>{test.title}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm font-semibold mb-2">Nivel: <span className="font-normal text-muted-foreground">{test.level}</span></p>
                           <div className="flex flex-wrap gap-2">
                            {test.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                           </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm">Ver Detalles</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>
         <TabsContent value="languages" className="p-4 border rounded-md mt-2">
          <p>No hay evaluaciones de idiomas disponibles.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
