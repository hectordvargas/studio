'use client';
import { useParams, notFound } from 'next/navigation';
import { jobs } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Building, MapPin, DollarSign, Briefcase, Calendar, GraduationCap, Languages, Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
      <div>
        <p className="font-semibold">{label}</p>
        <div className="text-muted-foreground">{value}</div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const job = jobs.find(j => j.id === id);

  if (!job) {
    notFound();
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg">
           <Image
            src={`https://picsum.photos/seed/${job.id}/1200/400`}
            alt={job.title}
            fill
            className="object-cover"
            data-ai-hint="job cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold md:text-4xl">{job.title}</h1>
            <p className="text-lg">{job.company} - {job.department}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Descripción del Empleo</h2>
                <p className="text-muted-foreground">{job.description}</p>
                
                <h2 className="mt-6 mb-4 text-xl font-semibold">Responsabilidades</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                </ul>

                <h2 className="mt-6 mb-4 text-xl font-semibold">Requisitos Clave</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {job.requirements.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Button size="lg" className="w-full">Aplicar Ahora</Button>
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="mb-4 text-xl font-semibold">Detalles del Empleo</h2>
                <DetailItem icon={MapPin} label="Ubicación" value={job.location} />
                <DetailItem icon={DollarSign} label="Salario" value={`${job.salary.min.toLocaleString()}-${job.salary.max.toLocaleString()} ${job.salary.currency}`} />
                <DetailItem icon={Briefcase} label="Tipo de Contrato" value={job.type} />
                <DetailItem icon={Calendar} label="Publicado" value={format(new Date(job.postedDate), "d 'de' MMMM, yyyy", { locale: es })} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
