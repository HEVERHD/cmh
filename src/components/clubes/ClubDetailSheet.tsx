// src/components/clubes/ClubDetailSheet.tsx
'use client';

import { useRouter } from 'next/navigation';
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
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Club } from '@/types/club';

interface Props {
    club: Club | null;
    onClose: () => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
    activo: { bg: 'var(--success-bg)', text: 'var(--success)' },
    anulado: { bg: 'var(--error-bg)', text: 'var(--error)' },
    cerrado: { bg: 'var(--muted-bg)', text: 'var(--text-muted)' },
    'en auditoría': { bg: 'var(--warning-bg)', text: 'var(--warning)' },
};

export function ClubDetailSheet({ club, onClose }: Props) {
    const router = useRouter();

    if (!club) return null;

    const handleNavigateToPaymentMethods = () => {
        router.push(`/clubes/${club.clubId}/formas-pago`);
        onClose();
    };

    return (
        <Sheet open={!!club} onOpenChange={() => onClose()}>
            <SheetContent className="sm:max-w-md overflow-y-auto" style={{ backgroundColor: 'var(--card)' }}>
                <SheetHeader>
                    <div className="flex items-center gap-3">
                        <SheetTitle style={{ color: 'var(--text-primary)' }}>Club #{club.contractNumber}</SheetTitle>
                        <span
                            className="px-2.5 py-1 text-xs font-medium rounded-full"
                            style={{
                                backgroundColor: statusColors[club.statusName?.toLowerCase() || '']?.bg || 'var(--muted-bg)',
                                color: statusColors[club.statusName?.toLowerCase() || '']?.text || 'var(--text-muted)',
                            }}
                        >
                            {club.statusName}
                        </span>
                    </div>
                    <SheetDescription style={{ color: 'var(--text-secondary)' }}>
                        Acción: {club.share} • {club.customerName}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-5">
                    {/* Balance y Acción */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--card-hover)' }}>
                            <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                <DollarSign className="h-4 w-4" />
                                Balance
                            </div>
                            <p className="text-2xl font-bold" style={{ color: club.balanceAmount < 0 ? 'var(--error)' : 'var(--success)' }}>
                                {formatCurrency(club.balanceAmount)}
                            </p>
                        </div>
                        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--card-hover)' }}>
                            <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                <Hash className="h-4 w-4" />
                                Acción
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {club.share}
                            </p>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div>
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
                            <User className="h-4 w-4" />
                            Cliente
                        </h4>
                        <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: 'var(--card-hover)' }}>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>Nombre</span>
                                <span className="font-medium text-right truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>
                                    {club.customerName}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>Cédula</span>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{club.customerNumber}</span>
                            </div>
                            {club.externalCode && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-secondary)' }}>Código Externo</span>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{club.externalCode}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalles del Club */}
                    <div>
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
                            <CreditCard className="h-4 w-4" />
                            Detalles del Club
                        </h4>
                        <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: 'var(--card-hover)' }}>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>Contrato</span>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{club.contractNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center">
                                <span style={{ color: 'var(--text-secondary)' }}>Estado</span>
                                <span
                                    className="px-2.5 py-1 text-xs font-medium rounded-full"
                                    style={{
                                        backgroundColor: statusColors[club.statusName?.toLowerCase() || '']?.bg || 'var(--muted-bg)',
                                        color: statusColors[club.statusName?.toLowerCase() || '']?.text || 'var(--text-muted)',
                                    }}
                                >
                                    {club.statusName}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>Balance</span>
                                <span className="font-medium" style={{ color: club.balanceAmount < 0 ? 'var(--error)' : 'var(--success)' }}>
                                    {formatCurrency(club.balanceAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Fechas */}
                    <div>
                        <h4 className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
                            <Calendar className="h-4 w-4" />
                            Fechas
                        </h4>
                        <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: 'var(--card-hover)' }}>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>Creación</span>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(club.createdDate)}</span>
                            </div>
                            {club.startDate && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-secondary)' }}>Inicio</span>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(club.startDate)}</span>
                                </div>
                            )}
                            {club.finishDate && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-secondary)' }}>Fin</span>
                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(club.finishDate)}</span>
                                </div>
                            )}
                            {club.cancellationDate && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-secondary)' }}>Cancelación</span>
                                    <span className="font-medium" style={{ color: 'var(--error)' }}>{formatDate(club.cancellationDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                        Acciones Rápidas
                    </h4>
                    <button
                        onClick={handleNavigateToPaymentMethods}
                        className="w-full flex items-center gap-3 p-4 rounded-lg transition-all"
                        style={{
                            backgroundColor: 'var(--card-hover)',
                            border: '1px solid var(--border)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--primary-bg)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--card-hover)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                    >
                        <div
                            className="p-2 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'var(--primary-bg)' }}
                        >
                            <CreditCard className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                Gestionar Formas de Pago
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Ver y administrar métodos de pago
                            </p>
                        </div>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                        Cerrar
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}