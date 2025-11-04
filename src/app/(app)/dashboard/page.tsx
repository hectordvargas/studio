'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard-header";
import { Briefcase, Users, FileText, Loader2 } from "lucide-react";
import { Candidate, Job, Application } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "../layout";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";

const chartData = [
  { name: "Frontend", total: 12 },
  { name: "Backend", total: 8 },
  { name: "Producto", total: 5 },
  { name: "Diseño", total: 7 },
  { name: "DevOps", total: 3 },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();

  const jobsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'jobs') : null, [firestore]);
  const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
  
  const applicationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'applications') : null, [firestore]);
  const { data: applications, isLoading: isLoadingApplications } = useCollection<Application>(applicationsQuery);
  
  const candidatesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'candidates') : null, [firestore]);
  const { data: candidates, isLoading: isLoadingCandidates } = useCollection<Candidate>(candidatesQuery);

  const recentApplicationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'applications'), orderBy('applicationDate', 'desc'), limit(5));
  }, [firestore]);
  const { data: recentApplications, isLoading: isLoadingRecentApps } = useCollection<Application>(recentApplicationsQuery);

  const isLoading = isLoadingJobs || isLoadingApplications || isLoadingCandidates || isLoadingRecentApps;

  const totalCandidates = useMemo(() => {
    if (!applications) return 0;
    return new Set(applications.map(app => app.candidateId)).size;
  }, [applications]);
  
  const openJobs = useMemo(() => jobs?.filter(job => job.status === 'Open').length || 0, [jobs]);
  
  const newApplicationsCount = useMemo(() => {
    if (!applications) return 0;
    return applications.filter(app => app.status === 'Pending').length;
  }, [applications]);

  const recentCandidates = useMemo(() => {
      if (!recentApplications || !candidates) return [];
      const candidateIds = recentApplications.map(app => app.candidateId);
      return candidates.filter(c => candidateIds.includes(c.id));
  }, [recentApplications, candidates]);


  const getAvatarUrl = (avatarId: string | undefined) => {
    if (!avatarId) return 'https://picsum.photos/seed/placeholder/100/100';
    const image = PlaceHolderImages.find(img => img.id === avatarId);
    return image ? image.imageUrl : `https://picsum.photos/seed/${avatarId}/100/100`;
  }
  
  const getApplicationForCandidate = (candidateId: string) => {
      return recentApplications?.find(app => app.candidateId === candidateId);
  }

  const getTranslatedStatus = (status: Application['status'] | undefined) => {
    if (!status) return t('applications.status.Pending');
    return t(`applications.status.${status}`);
  }

  return (
    <>
      <DashboardHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.openPositions')}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openJobs}</div>
            <p className="text-xs text-muted-foreground">
              {jobs?.length || 0} {t('dashboard.totalJobs')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalCandidates')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.inAllPositions')}
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.newApplications')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newApplicationsCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.awaitingReview')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.candidatesByDepartment')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.recentCandidates')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.candidate')}</TableHead>
                  <TableHead>{t('dashboard.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCandidates?.map((candidate) => {
                  const application = getApplicationForCandidate(candidate.id);
                  return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Link href={`/candidates/${candidate.id}`} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={getAvatarUrl(candidate.avatar)} alt={candidate.name} />
                            <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                            <span className="font-medium">{candidate.name}</span>
                            <span className="text-xs text-muted-foreground">{candidate.jobTitle}</span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={application?.status === 'Offer' || application?.status === 'Interview' ? 'default' : 'secondary'}>{getTranslatedStatus(application?.status)}</Badge>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
