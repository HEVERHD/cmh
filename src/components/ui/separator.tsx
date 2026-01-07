// src/components/clubes/ClubDetailSheet.tsx
'use client';

import {
    DollarSign,
    Calendar,
    Hash,
    User,
    X,
    FileText,
    CreditCard,
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Club } from '@/types/club';

interface Props {
    club: Club | null;
    onClose: () => void;
}

const statusColors: Record<string, string> = {
    activo: 'bg-green-100 text-green-800 border-green-200',
    anulado: 'bg-red-100 text-red-800 border-red-200',
    cerrado: 'bg-gray-100 text-gray-800 border-gray-200',
    'en auditoría': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export function ClubDetailSheet({ club, onClose }: Props) {
    if (!club) return null;

    return (
        <Sheet open={!!club} onOpenChange={() => onClose()}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg">
                            Club #{club.contractNumber}
                        </SheetTitle>
                        <Badge
                            variant="outline"
                            className={cn(
                                'font-medium',
                                statusColors[club.statusName?.toLowerCase() || ''] || 'bg-gray-100'
                            )}
                        >
                            {club.statusName}
                        </Badge>
                    </div>
                    <SheetDescription>
                        Share: {club.share} • {club.customerName}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Balance y Share */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                Balance
                            </div>
                            <p className={cn(
                                "text-xl font-semibold mt-1",
                                club.balanceAmount < 0 ? "text-red-600" : "text-green-600"
                            )}>
                                {formatCurrency(club.balanceAmount)}
                            </p>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Hash className="h-4 w-4" />
                                Share
                            </div>
                            <p className="text-xl font-semibold mt-1">
                                {club.share}
                            </p>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Cliente
                        </h4>
                        <div className="rounded-lg border p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nombre</span>
                                <span className="font-medium text-right truncate max-w-[180px]">
                                    {club.customerName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cédula</span>
                                <span className="font-medium">{club.customerNumber}</span>
                            </div>
                            {club.externalCode && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Código</span>
                                    <span className="font-medium">{club.externalCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalles del Club */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            Detalles
                        </h4>
                        <div className="rounded-lg border p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Contrato</span>
                                <span className="font-medium">{club.contractNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Estado</span>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'font-normal text-xs',
                                        statusColors[club.statusName?.toLowerCase() || '']
                                    )}
                                >
                                    {club.statusName}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Balance</span>
                                <span className={cn(
                                    "font-medium",
                                    club.balanceAmount < 0 ? "text-red-600" : "text-green-600"
                                )}>
                                    {formatCurrency(club.balanceAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Fechas
                        </h4>
                        <div className="rounded-lg border p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Creación</span>
                                <span className="font-medium">{formatDate(club.createdDate)}</span>
                            </div>
                            {club.startDate && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Inicio</span>
                                    <span className="font-medium">{formatDate(club.startDate)}</span>
                                </div>
                            )}
                            {club.finishDate && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fin</span>
                                    <span className="font-medium">{formatDate(club.finishDate)}</span>
                                </div>
                            )}
                            {club.cancellationDate && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cancelación</span>
                                    <span className="font-medium text-red-600">
                                        {formatDate(club.cancellationDate)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Cerrar
                    </Button>
                    <Button className="flex-1" disabled>
                        Editar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}