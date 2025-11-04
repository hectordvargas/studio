
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardHeader } from "@/components/dashboard-header";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { Candidate } from "@/lib/data";
import { useTranslation } from "@/app/layout";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function CandidatesPage() {
    const { t } = useTranslation();
    const firestore = useFirestore();

    const candidatesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'candidates') : null, [firestore]);
    const { data: candidates, isLoading } = useCollection<Candidate>(candidatesQuery);

    const getAvatarUrl = (avatarId: string | undefined) => {
        if (!avatarId) return 'https://picsum.photos/seed/placeholder/100/100';
        const image = PlaceHolderImages.find(img => img.id === avatarId);
        return image ? image.imageUrl : `https://picsum.photos/seed/${avatarId}/100/100`;
    }

    return (
        <>
            <DashboardHeader
                title={t('candidates.title')}
                description={t('candidates.description')}
            >
                <Button>
                    <PlusCircle className="mr-2" />
                    {t('candidates.addCandidate')}
                </Button>
            </DashboardHeader>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('candidates.table.name')}</TableHead>
                                <TableHead>{t('candidates.table.position')}</TableHead>
                                <TableHead><span className="sr-only">{t('candidates.table.actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        <div className="flex justify-center items-center p-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {candidates?.map((candidate) => (
                                <TableRow key={candidate.id}>
                                    <TableCell>
                                        <Link href={`/candidates/${candidate.id}`} className="flex items-center gap-3 group">
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
                                    <TableCell>{candidate.jobTitle}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t('candidates.table.actions')}</DropdownMenuLabel>
                                                <DropdownMenuItem asChild><Link href={`/candidates/${candidate.id}`}>{t('candidates.actions.viewProfile')}</Link></DropdownMenuItem>
                                                <DropdownMenuItem asChild><Link href={`/candidates/${candidate.id}/edit`}>{t('candidates.actions.edit')}</Link></DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">{t('candidates.actions.delete')}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
