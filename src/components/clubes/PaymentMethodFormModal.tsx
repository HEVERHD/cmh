'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ClubPaymentMethod, PaymentMethodType, CardBrand, CreatePaymentMethodDTO } from '@/types/club';
import { useCreatePaymentMethod, useUpdatePaymentMethod } from '@/lib/hooks/useClubs';
import { toast } from 'sonner';

interface PaymentMethodFormModalProps {
    clubId: string;
    paymentMethod?: ClubPaymentMethod;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const paymentTypes: { value: PaymentMethodType; label: string }[] = [
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'debit_card', label: 'Tarjeta de Débito' },
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'check', label: 'Cheque' },
    { value: 'wallet', label: 'Wallet Digital' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'other', label: 'Otro' },
];

const cardBrands: { value: CardBrand; label: string }[] = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'american_express', label: 'American Express' },
    { value: 'discover', label: 'Discover' },
    { value: 'diners', label: 'Diners Club' },
    { value: 'other', label: 'Otra' },
];

const accountTypes = [
    { value: 'checking', label: 'Cuenta Corriente' },
    { value: 'savings', label: 'Cuenta de Ahorro' },
];

export function PaymentMethodFormModal({
    clubId,
    paymentMethod,
    open,
    onOpenChange,
}: PaymentMethodFormModalProps) {
    const isEdit = !!paymentMethod;

    const [formData, setFormData] = useState<Partial<CreatePaymentMethodDTO>>({
        clubId,
        type: 'credit_card',
        holderName: '',
        nickname: '',
        isDefault: false,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const createMutation = useCreatePaymentMethod();
    const updateMutation = useUpdatePaymentMethod();

    useEffect(() => {
        if (open && paymentMethod) {
            setFormData({
                clubId: paymentMethod.clubId,
                type: paymentMethod.type,
                holderName: paymentMethod.holderName,
                nickname: paymentMethod.nickname,
                cardBrand: paymentMethod.cardBrand,
                last4: paymentMethod.last4,
                expiryMonth: paymentMethod.expiryMonth,
                expiryYear: paymentMethod.expiryYear,
                bankName: paymentMethod.bankName,
                accountType: paymentMethod.accountType,
                accountNumberLast4: paymentMethod.accountNumberLast4,
                routingNumber: paymentMethod.routingNumber,
                clabe: paymentMethod.clabe,
                checkNumber: paymentMethod.checkNumber,
                email: paymentMethod.email,
                phoneNumber: paymentMethod.phoneNumber,
                isDefault: paymentMethod.isDefault,
            });
        } else if (open) {
            setFormData({
                clubId,
                type: 'credit_card',
                holderName: '',
                nickname: '',
                isDefault: false,
            });
        }
        setFormErrors({});
    }, [open, paymentMethod, clubId]);

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.holderName?.trim()) {
            errors.holderName = 'El nombre del titular es requerido';
        }

        if (!formData.type) {
            errors.type = 'El tipo de forma de pago es requerido';
        }

        // Validaciones específicas por tipo
        if (formData.type === 'credit_card' || formData.type === 'debit_card') {
            if (!formData.last4 || formData.last4.length !== 4) {
                errors.last4 = 'Los últimos 4 dígitos son requeridos';
            }
            if (!formData.expiryMonth || formData.expiryMonth < 1 || formData.expiryMonth > 12) {
                errors.expiryMonth = 'Mes de expiración inválido';
            }
            if (!formData.expiryYear || formData.expiryYear < new Date().getFullYear()) {
                errors.expiryYear = 'Año de expiración inválido';
            }
        }

        if (formData.type === 'bank_transfer') {
            if (!formData.bankName?.trim()) {
                errors.bankName = 'El nombre del banco es requerido';
            }
            if (!formData.accountNumberLast4 || formData.accountNumberLast4.length !== 4) {
                errors.accountNumberLast4 = 'Los últimos 4 dígitos de la cuenta son requeridos';
            }
        }

        if (formData.type === 'check') {
            if (!formData.checkNumber?.trim()) {
                errors.checkNumber = 'El número de cheque es requerido';
            }
        }

        if (formData.type === 'paypal' || formData.type === 'wallet') {
            if (!formData.email?.trim() && !formData.phoneNumber?.trim()) {
                errors.email = 'Email o teléfono es requerido';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (isEdit && paymentMethod) {
                await updateMutation.mutateAsync({
                    paymentMethodId: paymentMethod.paymentMethodId,
                    data: {
                        holderName: formData.holderName,
                        nickname: formData.nickname,
                        expiryMonth: formData.expiryMonth,
                        expiryYear: formData.expiryYear,
                        isDefault: formData.isDefault,
                    },
                });
                toast.success('Forma de pago actualizada');
            } else {
                await createMutation.mutateAsync(formData as CreatePaymentMethodDTO);
                toast.success('Forma de pago creada exitosamente');
            }
            onOpenChange(false);
        } catch (error: any) {
            toast.error(isEdit ? 'Error al actualizar forma de pago' : 'Error al crear forma de pago', {
                description: error?.message || 'Intente nuevamente',
            });
        }
    };

    const renderFormFields = () => {
        switch (formData.type) {
            case 'credit_card':
            case 'debit_card':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Marca de Tarjeta *</Label>
                                <Select
                                    value={formData.cardBrand}
                                    onValueChange={(v) => handleInputChange('cardBrand', v as CardBrand)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cardBrands.map((brand) => (
                                            <SelectItem key={brand.value} value={brand.value}>
                                                {brand.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Últimos 4 dígitos *</Label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={formData.last4 || ''}
                                    onChange={(e) => handleInputChange('last4', e.target.value)}
                                    disabled={isEdit}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: formErrors.last4
                                            ? '1px solid var(--error)'
                                            : '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="1234"
                                />
                                {formErrors.last4 && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                        {formErrors.last4}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Mes de Expiración *</Label>
                                <input
                                    type="number"
                                    min={1}
                                    max={12}
                                    value={formData.expiryMonth || ''}
                                    onChange={(e) => handleInputChange('expiryMonth', parseInt(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: formErrors.expiryMonth
                                            ? '1px solid var(--error)'
                                            : '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="MM"
                                />
                                {formErrors.expiryMonth && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                        {formErrors.expiryMonth}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Año de Expiración *</Label>
                                <input
                                    type="number"
                                    min={new Date().getFullYear()}
                                    value={formData.expiryYear || ''}
                                    onChange={(e) => handleInputChange('expiryYear', parseInt(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: formErrors.expiryYear
                                            ? '1px solid var(--error)'
                                            : '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="YYYY"
                                />
                                {formErrors.expiryYear && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                        {formErrors.expiryYear}
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                );

            case 'bank_transfer':
                return (
                    <>
                        <div>
                            <Label>Nombre del Banco *</Label>
                            <input
                                type="text"
                                value={formData.bankName || ''}
                                onChange={(e) => handleInputChange('bankName', e.target.value)}
                                disabled={isEdit}
                                className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: formErrors.bankName
                                        ? '1px solid var(--error)'
                                        : '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="Banco Nacional"
                            />
                            {formErrors.bankName && (
                                <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                    {formErrors.bankName}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tipo de Cuenta</Label>
                                <Select
                                    value={formData.accountType}
                                    onValueChange={(v) => handleInputChange('accountType', v)}
                                    disabled={isEdit}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accountTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Últimos 4 dígitos *</Label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={formData.accountNumberLast4 || ''}
                                    onChange={(e) => handleInputChange('accountNumberLast4', e.target.value)}
                                    disabled={isEdit}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: formErrors.accountNumberLast4
                                            ? '1px solid var(--error)'
                                            : '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="5678"
                                />
                                {formErrors.accountNumberLast4 && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                        {formErrors.accountNumberLast4}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Routing Number</Label>
                                <input
                                    type="text"
                                    value={formData.routingNumber || ''}
                                    onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                                    disabled={isEdit}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="123456789"
                                />
                            </div>
                            <div>
                                <Label>CLABE</Label>
                                <input
                                    type="text"
                                    maxLength={18}
                                    value={formData.clabe || ''}
                                    onChange={(e) => handleInputChange('clabe', e.target.value)}
                                    disabled={isEdit}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="018180000118359719"
                                />
                            </div>
                        </div>
                    </>
                );

            case 'check':
                return (
                    <div>
                        <Label>Número de Cheque *</Label>
                        <input
                            type="text"
                            value={formData.checkNumber || ''}
                            onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                            disabled={isEdit}
                            className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: formErrors.checkNumber
                                    ? '1px solid var(--error)'
                                    : '1px solid var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            placeholder="001234"
                        />
                        {formErrors.checkNumber && (
                            <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                {formErrors.checkNumber}
                            </p>
                        )}
                    </div>
                );

            case 'paypal':
            case 'wallet':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Email</Label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={isEdit}
                                className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: formErrors.email
                                        ? '1px solid var(--error)'
                                        : '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="usuario@ejemplo.com"
                            />
                            {formErrors.email && (
                                <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                    {formErrors.email}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Teléfono</Label>
                            <input
                                type="tel"
                                value={formData.phoneNumber || ''}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                disabled={isEdit}
                                className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="+1234567890"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
                style={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                }}
            >
                <DialogHeader>
                    <DialogTitle style={{ color: 'var(--text-primary)' }}>
                        {isEdit ? 'Editar Forma de Pago' : 'Agregar Forma de Pago'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tipo de Forma de Pago */}
                    <div>
                        <Label>Tipo de Forma de Pago *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(v) => handleInputChange('type', v as PaymentMethodType)}
                            disabled={isEdit}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.type && (
                            <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                {formErrors.type}
                            </p>
                        )}
                    </div>

                    {/* Nombre del Titular */}
                    <div>
                        <Label>Nombre del Titular *</Label>
                        <input
                            type="text"
                            value={formData.holderName || ''}
                            onChange={(e) => handleInputChange('holderName', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: formErrors.holderName
                                    ? '1px solid var(--error)'
                                    : '1px solid var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            placeholder="Juan Pérez"
                        />
                        {formErrors.holderName && (
                            <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                                {formErrors.holderName}
                            </p>
                        )}
                    </div>

                    {/* Apodo/Nickname */}
                    <div>
                        <Label>Apodo (opcional)</Label>
                        <input
                            type="text"
                            value={formData.nickname || ''}
                            onChange={(e) => handleInputChange('nickname', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            placeholder="Ej: Tarjeta personal, Cuenta de ahorros"
                        />
                    </div>

                    {/* Campos específicos por tipo */}
                    {renderFormFields()}

                    {/* Establecer como predeterminada */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault || false}
                            onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                            className="w-4 h-4 rounded"
                            style={{
                                accentColor: 'var(--primary)',
                            }}
                        />
                        <Label htmlFor="isDefault" className="cursor-pointer">
                            Establecer como forma de pago predeterminada
                        </Label>
                    </div>

                    <DialogFooter className="gap-2">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2.5 rounded-lg font-medium transition-all"
                            style={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                            }}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            {isEdit ? 'Actualizar' : 'Crear'} Forma de Pago
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
