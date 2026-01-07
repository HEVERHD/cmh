// src/components/clubes/ClubCreateModal.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateClub, useClubTypes, useDenominations } from '@/lib/hooks/useClubs';
import { ClienteSearchSelect } from '@/components/shared/ClienteSearchSelect';
import { DEFAULT_VALUES } from '@/lib/data/mockData';
import { toast } from 'sonner';

const createClubSchema = z.object({
    customerId: z.string().min(1, 'Cliente es requerido'),
    clubTypeId: z.string().min(1, 'Tipo de club es requerido'),
    denominationId: z.string().min(1, 'Denominación es requerida'),
    share: z.number().min(1).max(99),
    startDate: z.string().min(1, 'Fecha de inicio es requerida'),
});

type CreateClubForm = z.infer<typeof createClubSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClubCreateModal({ open, onOpenChange }: Props) {
    const { data: clubTypes, isLoading: loadingTypes } = useClubTypes();
    const { data: denominations, isLoading: loadingDenominations } = useDenominations();
    const createMutation = useCreateClub();

    const form = useForm<CreateClubForm>({
        resolver: zodResolver(createClubSchema),
        defaultValues: {
            customerId: '',
            clubTypeId: '',
            denominationId: '',
            share: 1,
            startDate: new Date().toISOString().split('T')[0],
        },
    });

    const watchShare = form.watch('share');
    const watchDenominationId = form.watch('denominationId');

    useEffect(() => {
        if (!open) form.reset();
    }, [open, form]);

    const getShareLimit = (share: number) => {
        if (share >= 1 && share <= 39) return 100;
        if (share >= 40 && share <= 99) return 300;
        return 0;
    };

    const selectedDenomination = denominations?.find(
        (d) => d.denominationId === watchDenominationId
    );
    const weeklyAmount = selectedDenomination?.value || 0;
    const totalAmount = weeklyAmount * 52;

    const onSubmit = async (data: CreateClubForm) => {
        try {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0] + '.000';
            const formattedDate = `${data.startDate} ${timeStr}`;

            await createMutation.mutateAsync({
                ...data,
                startDate: formattedDate,
                saaSId: DEFAULT_VALUES.saaSId,
                salesAgentId: DEFAULT_VALUES.salesAgentId,
                storeId: DEFAULT_VALUES.storeId,
            });

            toast.success('Club creado exitosamente');
            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Error al crear club', {
                description: error?.message || 'Intente nuevamente',
            });
        }
    };

    const isLoadingCatalogs = loadingTypes || loadingDenominations;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Club</DialogTitle>
                    <DialogDescription>
                        Complete los datos para crear un nuevo club
                    </DialogDescription>
                </DialogHeader>

                {isLoadingCatalogs ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">Cargando...</span>
                    </div>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Cliente - Ahora con búsqueda */}
                        <div className="space-y-2">
                            <Label>Cliente *</Label>
                            <ClienteSearchSelect
                                value={form.watch('customerId')}
                                onChange={(value) => form.setValue('customerId', value, { shouldValidate: true })}
                                error={form.formState.errors.customerId?.message}
                            />
                        </div>

                        {/* Tipo de Club y Denominación */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Club *</Label>
                                <Select
                                    value={form.watch('clubTypeId')}
                                    onValueChange={(v) => form.setValue('clubTypeId', v, { shouldValidate: true })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clubTypes?.map((type) => (
                                            <SelectItem key={type.clubTypeId} value={type.clubTypeId}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.clubTypeId && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.clubTypeId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Denominación *</Label>
                                <Select
                                    value={form.watch('denominationId')}
                                    onValueChange={(v) => form.setValue('denominationId', v, { shouldValidate: true })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {denominations?.map((d) => (
                                            <SelectItem key={d.denominationId} value={d.denominationId}>
                                                ${d.value} semanal
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.denominationId && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.denominationId.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Share y Fecha */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Share (1-99) *</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={99}
                                    {...form.register('share', { valueAsNumber: true })}
                                />
                                {form.formState.errors.share && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.share.message}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Límite: {getShareLimit(watchShare)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Fecha de Inicio *</Label>
                                <Input type="date" {...form.register('startDate')} />
                                {form.formState.errors.startDate && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.startDate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Resumen */}
                        {watchDenominationId && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-sm mb-2">Resumen</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-gray-500">Semanal:</span>
                                    <span className="font-medium">${weeklyAmount}</span>
                                    <span className="text-gray-500">Total (52 sem):</span>
                                    <span className="font-medium">${totalAmount}</span>
                                </div>
                            </div>
                        )}

                        {watchShare >= 40 && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Shares 40-99 tienen límite de 300 participantes.
                                </AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Crear Club
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}