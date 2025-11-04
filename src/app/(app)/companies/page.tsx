
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Company, UserProfile } from "@/lib/data";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/app/layout";
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";

export default function CompaniesPage() {
    const { t } = useTranslation();
    const firestore = useFirestore();
    const { user } = useUser();

    const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const companiesRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'companies');
    }, [firestore]);

    const { data: companies, isLoading } = useCollection<Company>(companiesRef);
    
    const canCreateCompany = userProfile && ['root', 'Superadmin', 'Distribuidor'].includes(userProfile.role);

    return (
        <>
            <DashboardHeader
                title={t('companies.title')}
                description={t('companies.description')}
            >
                {canCreateCompany && (
                    <Button asChild>
                        <Link href="/companies/new">
                            <PlusCircle className="mr-2" />
                            {t('companies.addCompany')}
                        </Link>
                    </Button>
                )}
            </DashboardHeader>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies?.map((company) => (
                        <Card key={company.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                               <div className="flex items-center gap-4">
                                    <Avatar className="w-12 h-12 border">
                                        <AvatarImage src={company.logo} />
                                        <AvatarFallback>{company.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-xl">
                                            <Link href={`/companies/${company.id}`} className="hover:underline">
                                                {company.name}
                                            </Link>
                                        </CardTitle>
                                    </div>
                               </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/companies/${company.id}`}>{t('companies.actions.viewCompany')}</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/companies/${company.id}/edit`}>{t('companies.actions.edit')}</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">{t('companies.actions.delete')}</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground text-sm line-clamp-3">{company.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>{company.jobCount} {t('companies.activeOffers')}</span>
                                <Link href={`/companies/${company.id}`} className="text-primary font-medium hover:underline">
                                    {t('companies.viewMore')}
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </>
    )
}
