// src/components/clubes/ClubDetailSheet.tsx
'use client';

import {
    DollarSign,
    Calendar,
    Hash,
    User,
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
    activo: 'bg-green-100 text-green-800',
    anulado: 'bg-red-100 text-red-800',
    cerrado: 'bg-gray-100 text-gray-800',
    'en auditoría': 'bg-yellow-100 text-yellow-800',
};

export function ClubDetailSheet({ club, onClose }: Props) {
    if (!club) return null;

    return (
        <Sheet open={!!club} onOpenChange={() => onClose()}>
            <SheetContent className="sm:max-w-md overflow-y-auto bg-white">
                <SheetHeader>
                    <div className="flex items-center gap-3">
                        <SheetTitle>Club #{club.contractNumber}</SheetTitle>
                        <Badge className={cn('font-normal', statusColors[club.statusName?.toLowerCase() || ''])}>
                            {club.statusName}
                        </Badge>
                    </div>
                    <SheetDescription>
                        Share: {club.share} • {club.customerName}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-5">
                    {/* Balance y Share */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                <DollarSign className="h-4 w-4" />
                                Balance
                            </div>
                            <p className={cn(
                                "text-2xl font-bold",
                                club.balanceAmount < 0 ? "text-red-600" : "text-green-600"
                            )}>
                                {formatCurrency(club.balanceAmount)}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                <Hash className="h-4 w-4" />
                                Share
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {club.share}
                            </p>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                            <User className="h-4 w-4" />
                            Cliente
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Nombre</span>
                                <span className="font-medium text-gray-900 text-right truncate max-w-[200px]">
                                    {club.customerName}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Cédula</span>
                                <span className="font-medium text-gray-900">{club.customerNumber}</span>
                            </div>
                            {club.externalCode && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Código Externo</span>
                                    <span className="font-medium text-gray-900">{club.externalCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalles del Club */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                            <CreditCard className="h-4 w-4" />
                            Detalles del Club
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Contrato</span>
                                <span className="font-medium text-gray-900">{club.contractNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-gray-500">Estado</span>
                                <Badge className={cn('font-normal', statusColors[club.statusName?.toLowerCase() || ''])}>
                                    {club.statusName}
                                </Badge>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Balance</span>
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
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4" />
                            Fechas
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Creación</span>
                                <span className="font-medium text-gray-900">{formatDate(club.createdDate)}</span>
                            </div>
                            {club.startDate && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Inicio</span>
                                    <span className="font-medium text-gray-900">{formatDate(club.startDate)}</span>
                                </div>
                            )}
                            {club.finishDate && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Fin</span>
                                    <span className="font-medium text-gray-900">{formatDate(club.finishDate)}</span>
                                </div>
                            )}
                            {club.cancellationDate && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Cancelación</span>
                                    <span className="font-medium text-red-600">{formatDate(club.cancellationDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}