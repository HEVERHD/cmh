'use client';

import { useState } from 'react';
import {
    CreditCard,
    Building,
    DollarSign,
    MoreVertical,
    Edit,
    Trash2,
    Star,
    StarOff,
    CheckCircle2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ClubPaymentMethod, PaymentMethodType, CardBrand } from '@/types/club';
import { useDeletePaymentMethod, useSetDefaultPaymentMethod, useUpdatePaymentMethod } from '@/lib/hooks/useClubs';
import { toast } from 'sonner';
import { PaymentMethodFormModal } from './PaymentMethodFormModal';

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

const cardBrandLogos: Record<CardBrand, string> = {
    visa: '💳',
    mastercard: '💳',
    american_express: '💳',
    discover: '💳',
    diners: '💳',
    other: '💳',
};

interface PaymentMethodCardProps {
    paymentMethod: ClubPaymentMethod;
}

export function PaymentMethodCard({ paymentMethod }: PaymentMethodCardProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const deleteMutation = useDeletePaymentMethod();
    const setDefaultMutation = useSetDefaultPaymentMethod();
    const updateMutation = useUpdatePaymentMethod();

    const Icon = paymentTypeIcons[paymentMethod.type];

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta forma de pago?')) {
            return;
        }

        try {
            await deleteMutation.mutateAsync({
                paymentMethodId: paymentMethod.paymentMethodId,
                clubId: paymentMethod.clubId,
            });
            toast.success('Forma de pago eliminada');
        } catch (error: any) {
            toast.error('Error al eliminar forma de pago', {
                description: error?.message || 'Intente nuevamente',
            });
        }
    };

    const handleSetDefault = async () => {
        try {
            await setDefaultMutation.mutateAsync({
                clubId: paymentMethod.clubId,
                paymentMethodId: paymentMethod.paymentMethodId,
            });
            toast.success('Forma de pago establecida como predeterminada');
        } catch (error: any) {
            toast.error('Error al establecer forma de pago predeterminada', {
                description: error?.message || 'Intente nuevamente',
            });
        }
    };

    const handleToggleActive = async () => {
        try {
            await updateMutation.mutateAsync({
                paymentMethodId: paymentMethod.paymentMethodId,
                data: { active: !paymentMethod.active },
            });
            toast.success(paymentMethod.active ? 'Forma de pago desactivada' : 'Forma de pago activada');
        } catch (error: any) {
            toast.error('Error al actualizar forma de pago', {
                description: error?.message || 'Intente nuevamente',
            });
        }
    };

    const renderPaymentDetails = () => {
        switch (paymentMethod.type) {
            case 'credit_card':
            case 'debit_card':
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{cardBrandLogos[paymentMethod.cardBrand || 'other']}</span>
                            <span className="font-mono text-lg">•••• {paymentMethod.last4}</span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Expira: {paymentMethod.expiryMonth?.toString().padStart(2, '0')}/{paymentMethod.expiryYear}
                        </p>
                    </div>
                );

            case 'bank_transfer':
                return (
                    <div className="space-y-1">
                        <p className="font-medium">{paymentMethod.bankName}</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {paymentMethod.accountType === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorro'}
                        </p>
                        <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                            •••• {paymentMethod.accountNumberLast4}
                        </p>
                    </div>
                );

            case 'paypal':
            case 'wallet':
                return (
                    <div className="space-y-1">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {paymentMethod.email || paymentMethod.phoneNumber}
                        </p>
                    </div>
                );

            case 'check':
                return (
                    <div className="space-y-1">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Cheque #{paymentMethod.checkNumber}
                        </p>
                    </div>
                );

            case 'cash':
                return (
                    <div className="space-y-1">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Pagos en efectivo
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div
                className="rounded-xl border p-5 transition-all relative"
                style={{
                    backgroundColor: 'var(--card)',
                    borderColor: paymentMethod.isDefault ? 'var(--primary)' : 'var(--border)',
                    borderWidth: paymentMethod.isDefault ? '2px' : '1px',
                    opacity: paymentMethod.active ? 1 : 0.6,
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Default Badge */}
                {paymentMethod.isDefault && (
                    <div
                        className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                        }}
                    >
                        <Star className="w-3 h-3 fill-current" />
                        Predeterminada
                    </div>
                )}

                {/* Verified Badge */}
                {paymentMethod.verifiedDate && (
                    <div
                        className="absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                        style={{
                            backgroundColor: 'var(--success)',
                            color: 'white',
                        }}
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        Verificada
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: 'var(--primary-bg)',
                            }}
                        >
                            <Icon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {paymentMethod.nickname || paymentTypeLabels[paymentMethod.type]}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {paymentMethod.holderName}
                            </p>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                    backgroundColor: isHovered ? 'var(--card-hover)' : 'transparent',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </DropdownMenuItem>
                            {!paymentMethod.isDefault && (
                                <DropdownMenuItem onClick={handleSetDefault}>
                                    <Star className="w-4 h-4 mr-2" />
                                    Establecer como predeterminada
                                </DropdownMenuItem>
                            )}
                            {paymentMethod.isDefault && (
                                <DropdownMenuItem disabled>
                                    <StarOff className="w-4 h-4 mr-2" />
                                    Ya es predeterminada
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={handleToggleActive}>
                                {paymentMethod.active ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Payment Details */}
                <div style={{ color: 'var(--text-primary)' }}>{renderPaymentDetails()}</div>

                {/* Footer Info */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Agregada: {new Date(paymentMethod.createdDate).toLocaleDateString('es-ES')}
                    </p>
                </div>
            </div>

            {/* Edit Modal */}
            <PaymentMethodFormModal
                clubId={paymentMethod.clubId}
                paymentMethod={paymentMethod}
                open={showEditModal}
                onOpenChange={setShowEditModal}
            />
        </>
    );
}
