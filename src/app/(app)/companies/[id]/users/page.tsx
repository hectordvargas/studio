

'use client';

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, setDoc } from "firebase/firestore";
import type { Company, UserProfile } from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreHorizontal, PlusCircle, Loader2, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";


export default function CompanyUsersPage() {
    const params = useParams<{ id: string }>();
    const firestore = useFirestore();

    const companyRef = useMemoFirebase(() => firestore ? doc(firestore, 'companies', params.id) : null, [firestore, params.id]);
    const { data: company, isLoading: isLoadingCompany } = useDoc<Company>(companyRef);

    const usersRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('companyIds', 'array-contains', params.id));
    }, [firestore, params.id]);
    const { data: companyUsers, isLoading: isLoadingUsers, setData: setCompanyUsers } = useCollection<UserProfile>(usersRef);

    const isLoading = isLoadingCompany || isLoadingUsers;

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!company) {
        notFound();
    }

    return (
        <>
            <DashboardHeader
                title={`Usuarios de ${company.name}`}
                description="Gestiona quién tiene acceso a esta empresa."
            >
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/companies/${company.id}`}>
                            <ArrowLeft className="mr-2" />
                            Volver a la Empresa
                        </Link>
                    </Button>
                </div>
            </DashboardHeader>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companyUsers && companyUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{user.displayName?.substring(0, 2) || 'SN'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.displayName}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem>Editar Usuario</DropdownMenuItem>
                                                <DropdownMenuItem>Cambiar Rol</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Eliminar Usuario</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {companyUsers && companyUsers.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">Esta empresa aún no tiene usuarios asignados.</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
