'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Copy, Link2, Globe, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Job, Company, Application } from "@/lib/data";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useTranslation } from "../layout";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export default function JobsPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const firestore = useFirestore();

    const jobsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'jobs') : null, [firestore]);
    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);

    const companiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'companies') : null, [firestore]);
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<Company>(companiesQuery);

    const applicationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'applications') : null, [firestore]);
    const { data: applications, isLoading: isLoadingApplications } = useCollection<Application>(applicationsQuery);

    const isLoading = isLoadingJobs || isLoadingCompanies || isLoadingApplications;

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'Open':
                return 'default';
            case 'Closed':
                return 'secondary';
            case 'Cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    }
    
    const getTranslatedStatus = (status: Job['status']) => {
        return t(`jobs.status.${status}`);
    }

    const handleDuplicate = (jobId: string) => {
        toast({
            title: t('jobs.toast.duplicated'),
            description: t('jobs.toast.duplicatedDescription'),
        });
    };

    const jobsWithCounts = useMemo(() => {
        if (!jobs || !applications) return [];
        return jobs.map(job => ({
            ...job,
            candidateCount: applications.filter(app => app.jobId === job.id).length
        }));
    }, [jobs, applications]);

    return (
        <>
            <DashboardHeader
                title={t('jobs.title')}
                description={t('jobs.description')}
            >
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/empleos" target="_blank">
                            <Globe className="mr-2" />
                            {t('jobs.publicView')}
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/jobs/new">
                            <PlusCircle className="mr-2" />
                            {t('jobs.addJob')}
                        </Link>
                    </Button>
                </div>
            </DashboardHeader>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('jobs.table.title')}</TableHead>
                                <TableHead>{t('jobs.table.company')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('jobs.table.department')}</TableHead>
                                <TableHead>{t('jobs.table.status')}</TableHead>
                                <TableHead className="hidden sm:table-cell">{t('jobs.table.candidates')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('jobs.table.published')}</TableHead>
                                <TableHead><span className="sr-only">{t('jobs.table.actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">
                                        <Loader2 className="mx-auto animate-spin" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && jobsWithCounts?.map((job) => {
                                const company = companies?.find(c => c.id === job.companyId);
                                return (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                                            {job.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{company?.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">{job.department}</TableCell>
                                    <TableCell>
                                        <Badge variant={getBadgeVariant(job.status)}>
                                            {getTranslatedStatus(job.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{job.candidateCount}</TableCell>
                                    <TableCell className="hidden md:table-cell">{job.postedDate}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">{t('jobs.actions.openMenu')}</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t('jobs.actions.label')}</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/jobs/${job.id}`}>{t('jobs.actions.details')}</Link>
                                                </DropdownMenuItem>
                                                {job.slug && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/empleos/${job.slug}`} target="_blank">
                                                        <Link2 className="mr-2 h-4 w-4"/>
                                                        {t('jobs.actions.publicPage')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/jobs/${job.id}/edit`}>{t('jobs.actions.edit')}</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/jobs/new?duplicate=${job.id}`} onClick={() => handleDuplicate(job.id)}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        {t('jobs.actions.duplicate')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>{t('jobs.actions.changeStatus')}</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem>{t('jobs.actions.open')}</DropdownMenuItem>
                                                        <DropdownMenuItem>{t('jobs.actions.closed')}</DropdownMenuItem>
                                                        <DropdownMenuItem>{t('jobs.actions.archived')}</DropdownMenuItem>
                                                        <DropdownMenuItem>{t('jobs.actions.cancelled')}</DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">{t('jobs.actions.delete')}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
