'use client';
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { candidates } from "@/lib/data";

export default function CandidatesPage() {
  return (
    <div>
      <DashboardHeader
        title="Candidatos"
        description="Explora y gestiona todos los candidatos en tu base de datos."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Candidato
        </Button>
      </DashboardHeader>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Puesto Actual</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-muted-foreground text-sm">{candidate.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{candidate.jobTitle}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Ver Perfil</Button>
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="destructive" size="sm">Eliminar</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
