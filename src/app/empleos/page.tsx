'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { jobs } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function EmpleosPage() {
  return (
    <>
      <section className="bg-muted/40 py-12 md:py-20">
        <div className="container text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Encuentra tu Próximo Desafío
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Explora las oportunidades disponibles en nuestras empresas asociadas.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-20">
        <div className="container">
          {jobs.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map(job => (
                <Card key={job.id} className="flex flex-col">
                   <CardHeader>
                      <div className="aspect-[2/1] w-full overflow-hidden rounded-lg">
                        <Image
                          src={`https://picsum.photos/seed/${job.id}/600/300`}
                          alt={job.title}
                          width={600}
                          height={300}
                          className="object-cover transition-transform group-hover:scale-105"
                          data-ai-hint="job cover"
                        />
                      </div>
                    <CardTitle className="pt-4">{job.title}</CardTitle>
                    <CardDescription>{job.company} - {job.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="line-clamp-3 text-sm text-muted-foreground">{job.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                     <Badge variant="secondary">{job.type}</Badge>
                    <Button asChild>
                      <Link href={`/empleos/${job.id}`}>Ver Detalles</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <div className="text-center">
              <h2 className="text-2xl font-semibold">No hay plazas abiertas en este momento.</h2>
              <p className="mt-2 text-muted-foreground">Vuelve a consultar más tarde para ver nuevas oportunidades.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
