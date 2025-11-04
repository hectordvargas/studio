'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard-header";
import { Application, Company, Job, Candidate } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { useTranslation } from "../layout";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function ApplicationsPage() {
    const { t } = useTranslation();
    const firestore = useFirestore();

    const applicationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'applications') : null, [firestore]);
    const { data: applications, isLoading: isLoadingApplications } = useCollection<Application>(applicationsQuery);

    const jobsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'jobs') : null, [firestore]);
    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);

    const candidatesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'candidates') : null, [firestore]);
    const { data: candidates, isLoading: isLoadingCandidates } = useCollection<Candidate>(candidatesQuery);

    const companiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'companies') : null, [firestore]);
    const { data: companies, isLoading: isLoadingCompanies } = useCollection<Company>(companiesQuery);

    const isLoading = isLoadingApplications || isLoadingJobs || isLoadingCandidates || isLoadingCompanies;

    const getAvatarUrl = (avatarId: string | undefined) => {
        if (!avatarId) return 'https://picsum.photos/seed/placeholder/100/100';
        const image = PlaceHolderImages.find(img => img.id === avatarId);
        return image ? image.imageUrl : `https://picsum.photos/seed/${avatarId}/100/100`;
    }

    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'Hired':
            case 'Offer':
                return 'default';
            case 'Interview':
            case 'Assessment':
                return 'secondary';
            case 'Rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    }

    const getTranslatedStatus = (status: Application['status']) => {
        return t(`applications.status.${status}`);
    }
    
    return (
        <>
            <DashboardHeader
                title={t('applications.title')}
                description={t('applications.description')}
            />
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('applications.table.candidate')}</TableHead>
                                <TableHead>{t('applications.table.appliedPosition')}</TableHead>
                                <TableHead>{t('applications.table.status')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('applications.table.applicationDate')}</TableHead>
                                <TableHead><span className="sr-only">{t('applications.table.actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <Loader2 className="mx-auto animate-spin" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && applications?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        {t('applications.noApplications')}
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && applications?.map((application) => {
                                const candidate = candidates?.find(c => c.id === application.candidateId);
                                const job = jobs?.find(j => j.id === application.jobId);
                                const company = companies?.find(c => c.id === job?.companyId);

                                if (!candidate || !job) return null;

                                return (
                                    <TableRow key={application.id}>
                                        <TableCell>
                                            <Link href={`/applications/${application.id}`} className="flex items-center gap-3 group">
                                                <Avatar>
                                                    <AvatarImage src={getAvatarUrl(candidate.avatar)} />
                                                    <AvatarFallback>{candidate.name.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <div className="grid">
                                                    <span className="font-medium group-hover:underline">{candidate.name}</span>
                                                    <span className="text-sm text-muted-foreground">{candidate.email}</span>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">{job.title}</Link>
                                                <p className="text-sm text-muted-foreground">{company?.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getBadgeVariant(application.status)}>{getTranslatedStatus(application.status)}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{application.applicationDate}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('applications.table.actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild><Link href={`/applications/${application.id}`}>{t('applications.actions.viewApplication')}</Link></DropdownMenuItem>
                                                    <DropdownMenuItem asChild><Link href={`/candidates/${candidate.id}`}>{t('applications.actions.viewCandidateProfile')}</Link></DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">{t('applications.actions.reject')}</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
