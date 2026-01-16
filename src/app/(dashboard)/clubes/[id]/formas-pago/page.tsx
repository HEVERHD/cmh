'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, CreditCard, Building, DollarSign, Loader2 } from 'lucide-react';
import { usePaymentMethods, useClub } from '@/lib/hooks/useClubs';
import { PaymentMethodCard } from '@/components/clubes/PaymentMethodCard';
import { PaymentMethodFormModal } from '@/components/clubes/PaymentMethodFormModal';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentMethodType } from '@/types/club';

const paymentTypeIcons: Record<PaymentMethodType, any> = {
    credit_card: CreditCard,
    debit_card: CreditCard,
    bank_transfer: Building,
    cash: DollarSign,
    check: DollarSign,
    wallet: DollarSign,
    paypal: DollarSign,
    other: DollarSign,
};

const paymentTypeLabels: Record<PaymentMethodType, string> = {
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito',
    bank_transfer: 'Transferencia Bancaria',
    cash: 'Efectivo',
    check: 'Cheque',
    wallet: 'Wallet Digital',
    paypal: 'PayPal',
    other: 'Otro',
};

export default function FormasPagoPage() {
    const params = useParams();
    const router = useRouter();
    const clubId = params.id as string;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterType, setFilterType] = useState<PaymentMethodType | 'all'>('all');

    const { data: club, isLoading: isLoadingClub } = useClub(clubId);
    const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods(clubId);

    const filteredPaymentMethods = paymentMethods?.filter((pm) =>
        filterType === 'all' ? true : pm.type === filterType
    );

    const activePaymentMethods = filteredPaymentMethods?.filter((pm) => pm.active) || [];
    const inactivePaymentMethods = filteredPaymentMethods?.filter((pm) => !pm.active) || [];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            {/* Header */}
            <div
                className="border-b sticky top-0 z-10 backdrop-blur-sm"
                style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--card-hover)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Formas de Pago
                                </h1>
                                {isLoadingClub ? (
                                    <Skeleton className="h-4 w-48 mt-1" />
                                ) : (
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {club?.customerName} - Contrato: {club?.contractNumber}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all"
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Forma de Pago
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="mb-6">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                filterType === 'all' ? 'font-medium' : ''
                            }`}
                            style={{
                                backgroundColor: filterType === 'all' ? 'var(--primary)' : 'var(--card)',
                                color: filterType === 'all' ? 'white' : 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            Todas
                        </button>
                        {Object.entries(paymentTypeLabels).map(([type, label]) => {
                            const Icon = paymentTypeIcons[type as PaymentMethodType];
                            return (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type as PaymentMethodType)}
                                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                        filterType === type ? 'font-medium' : ''
                                    }`}
                                    style={{
                                        backgroundColor:
                                            filterType === type ? 'var(--primary)' : 'var(--card)',
                                        color: filterType === type ? 'white' : 'var(--text-secondary)',
                                        border: '1px solid var(--border)',
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Loading State */}
                {isLoadingPaymentMethods && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
                        <span className="ml-3" style={{ color: 'var(--text-secondary)' }}>
                            Cargando formas de pago...
                        </span>
                    </div>
                )}

                {/* Empty State */}
                {!isLoadingPaymentMethods && activePaymentMethods.length === 0 && inactivePaymentMethods.length === 0 && (
                    <div
                        className="text-center py-16 rounded-xl border"
                        style={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <CreditCard className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            No hay formas de pago
                        </h3>
                        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                            Agrega una forma de pago para comenzar a procesar pagos
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Primera Forma de Pago
                        </button>
                    </div>
                )}

                {/* Active Payment Methods */}
                {activePaymentMethods.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Formas de Pago Activas ({activePaymentMethods.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activePaymentMethods.map((paymentMethod) => (
                                <PaymentMethodCard key={paymentMethod.paymentMethodId} paymentMethod={paymentMethod} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Inactive Payment Methods */}
                {inactivePaymentMethods.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Formas de Pago Inactivas ({inactivePaymentMethods.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                            {inactivePaymentMethods.map((paymentMethod) => (
                                <PaymentMethodCard key={paymentMethod.paymentMethodId} paymentMethod={paymentMethod} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <PaymentMethodFormModal
                clubId={clubId}
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />
        </div>
    );
}
