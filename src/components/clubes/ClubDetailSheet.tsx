// src/components/clubes/ClubDetailSheet.tsx
'use client';

import { useState } from 'react';
import {
    X,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Calendar,
    User,
    Store,
    Hash,
    Loader2,
    ChevronRight,
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useClub,
    useClubWeeks,
    useClubTransactions,
    useClubHistory,
    useClubTypes,
    useClubStatuses,
    useDenominations,
} from '@/lib/hooks/useClubs';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

interface Props {
    clubId: string | null;
    onClose: () => void;
}

const statusColors: Record<string, string> = {
    activo: 'bg-green-100 text-green-800',
    anulado: 'bg-red-100 text-red-800',
    cerrado: 'bg-gray-100 text-gray-800',
    'en auditoría': 'bg-yellow-100 text-yellow-800',
};

const weekStatusConfig: Record<string, { color: string; label: string }> = {
    paid: { color: 'bg-green-100 text-green-800', label: 'Pagado' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
    late: { color: 'bg-red-100 text-red-800', label: 'Atrasado' },
    cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' },
};

export function ClubDetailSheet({ clubId, onClose }: Props) {
    const [activeTab, setActiveTab] = useState('info');

    // Queries
    const { data: club, isLoading: loadingClub } = useClub(clubId || '');
    const { data: weeks, isLoading: loadingWeeks } = useClubWeeks(clubId || '');
    const { data: transactions, isLoading: loadingTransactions } = useClubTransactions(clubId || '');
    const { data: history, isLoading: loadingHistory } = useClubHistory(clubId || '');

    // Catálogos
    const { data: clubTypes } = useClubTypes();
    const { data: clubStatuses } = useClubStatuses();
    const { data: denominations } = useDenominations();

    if (!clubId) return null;

    // Datos derivados
    const clubType = clubTypes?.find((t) => t.clubTypeId === club?.clubTypeId);
    const clubStatus = clubStatuses?.find((s) => s.clubStatusId === club?.clubStatusId);
    const denomination = denominations?.find((d) => d.denominationId === club?.denominationId);
    const progress = club ? (club.weeksPaid / 52) * 100 : 0;

    return (
        <Sheet open={!!clubId} onOpenChange={() => onClose()}>
            <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
                {/* Header */}
                <SheetHeader className="px-6 py-4 border-b">
                    <div className="flex items-start justify-between">
                        <div>
                            <SheetTitle className="text-xl flex items-center gap-2">
                                Club #{club?.contractNumber || '...'}
                                {club && (
                                    <Badge
                                        className={cn(
                                            'font-normal ml-2',
                                            statusColors[clubStatus?.name?.toLowerCase() || ''] ||
                                            'bg-gray-100'
                                        )}
                                    >
                                        {clubStatus?.name || 'Cargando...'}
                                    </Badge>
                                )}
                            </SheetTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Share: {club?.share || '...'} • {clubType?.name || '...'}
                            </p>
                        </div>
                    </div>
                </SheetHeader>

                {/* Content */}
                <ScrollArea className="flex-1">
                    {loadingClub ? (
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : club ? (
                        <div className="p-6 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-sm font-medium">Pagado</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {formatCurrency(club.paidAmount)}
                                    </p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm font-medium">Pendiente</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-700">
                                        {formatCurrency(club.balanceAmount)}
                                    </p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-green-600 mb-1">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Semanas Pagadas</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700">
                                        {club.weeksPaid}/52
                                    </p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-600 mb-1">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">Semanas Tarde</span>
                                    </div>
                                    <p className="text-2xl font-bold text-red-700">
                                        {club.weeksLate}
                                    </p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">Progreso del club</span>
                                    <span className="font-medium">{progress.toFixed(1)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            {/* Tabs */}
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="w-full">
                                    <TabsTrigger value="info" className="flex-1">
                                        Información
                                    </TabsTrigger>
                                    <TabsTrigger value="weeks" className="flex-1">
                                        Semanas
                                    </TabsTrigger>
                                    <TabsTrigger value="transactions" className="flex-1">
                                        Transacciones
                                    </TabsTrigger>
                                    <TabsTrigger value="history" className="flex-1">
                                        Historial
                                    </TabsTrigger>
                                </TabsList>

                                {/* Tab: Información */}
                                <TabsContent value="info" className="mt-4 space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <h4 className="font-medium text-sm text-gray-700">
                                            Datos del Club
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Hash className="h-4 w-4" />
                                                Contrato:
                                            </div>
                                            <span className="font-medium">{club.contractNumber}</span>

                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                Tipo:
                                            </div>
                                            <span>{clubType?.name || '-'}</span>

                                            <div className="flex items-center gap-2 text-gray-500">
                                                <DollarSign className="h-4 w-4" />
                                                Denominación:
                                            </div>
                                            <span>${denomination?.value || '-'} semanal</span>

                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                Fecha inicio:
                                            </div>
                                            <span>{formatDate(club.startDate)}</span>

                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar className="h-4 w-4" />
                                                Fecha fin:
                                            </div>
                                            <span>{formatDate(club.finishDate)}</span>

                                            {club.prizeDate && (
                                                <>
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <CheckCircle className="h-4 w-4" />
                                                        Fecha premio:
                                                    </div>
                                                    <span className="text-green-600 font-medium">
                                                        {formatDate(club.prizeDate)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <h4 className="font-medium text-sm text-gray-700">
                                            Montos
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                                            <span className="text-gray-500">Total esperado:</span>
                                            <span className="font-medium">
                                                {formatCurrency(club.totalAmount)}
                                            </span>

                                            <span className="text-gray-500">Monto pagado:</span>
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(club.paidAmount)}
                                            </span>

                                            <span className="text-gray-500">Monto retirado:</span>
                                            <span className="font-medium">
                                                {formatCurrency(club.retiredAmount)}
                                            </span>

                                            <span className="text-gray-500">Balance pendiente:</span>
                                            <span className="font-medium text-orange-600">
                                                {formatCurrency(club.balanceAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Tab: Semanas */}
                                <TabsContent value="weeks" className="mt-4">
                                    {loadingWeeks ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                        </div>
                                    ) : weeks && weeks.length > 0 ? (
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {weeks.map((week) => (
                                                <div
                                                    key={week.clubWeekId}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-medium border">
                                                            {week.weekNumber}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                Semana {week.weekNumber}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Vence: {formatDate(week.dueDate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium">
                                                            {formatCurrency(week.amount)}
                                                        </span>
                                                        <Badge
                                                            className={cn(
                                                                'font-normal',
                                                                weekStatusConfig[week.status]?.color ||
                                                                'bg-gray-100'
                                                            )}
                                                        >
                                                            {weekStatusConfig[week.status]?.label || week.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay semanas registradas
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Tab: Transacciones */}
                                <TabsContent value="transactions" className="mt-4">
                                    {loadingTransactions ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                        </div>
                                    ) : transactions && transactions.length > 0 ? (
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {transactions.map((tx) => (
                                                <div
                                                    key={tx.transactionId}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {tx.description || 'Transacción'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(tx.createdDate)}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            'text-sm font-medium',
                                                            tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                                                        )}
                                                    >
                                                        {tx.amount > 0 ? '+' : ''}
                                                        {formatCurrency(tx.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay transacciones registradas
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Tab: Historial */}
                                <TabsContent value="history" className="mt-4">
                                    {loadingHistory ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                        </div>
                                    ) : history && history.length > 0 ? (
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {history.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 bg-gray-50 rounded-lg text-sm"
                                                >
                                                    <p className="font-medium">{item.description || item.action}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(item.createdDate || item.date)} • {item.createdBy || item.user}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay historial disponible
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            No se encontró el club
                        </div>
                    )}
                </ScrollArea>

                {/* Footer Actions */}
                {club && (
                    <div className="border-t px-6 py-4 flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Cerrar
                        </Button>
                        <Button className="flex-1">
                            Editar Club
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}