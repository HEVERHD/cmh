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
import { useToast } from '@/components/ui/use-toast';
import {
    useCreateClub,
    useClubTypes,
    useDenominations,
} from '@/lib/hooks/useClubs';
import { useClientes } from '@/lib/hooks/useClientes';

// Schema de validación
const createClubSchema = z.object({
    customerId: z.string().min(1, 'Cliente es requerido'),
    clubTypeId: z.string().min(1, 'Tipo de club es requerido'),
    denominationId: z.string().min(1, 'Denominación es requerida'),
    salesAgentId: z.string().min(1, 'Agente de ventas es requerido'),
    storeId: z.string().min(1, 'Tienda es requerida'),
    share: z
        .number()
        .min(1, 'Share debe ser mayor a 0')
        .max(99, 'Share debe ser menor a 100'),
    startDate: z.string().min(1, 'Fecha de inicio es requerida'),
});

type CreateClubForm = z.infer<typeof createClubSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClubCreateModal({ open, onOpenChange }: Props) {
    const { toast } = useToast();

    // Queries para catálogos
    const { data: clubTypes, isLoading: loadingTypes } = useClubTypes();
    const { data: denominations, isLoading: loadingDenominations } = useDenominations();
    const { data: clientes, isLoading: loadingClientes } = useClientes({}, 1, 100);

    // Mutation
    const createMutation = useCreateClub();

    // Form
    const form = useForm<CreateClubForm>({
        resolver: zodResolver(createClubSchema),
        defaultValues: {
            customerId: '',
            clubTypeId: '',
            denominationId: '',
            salesAgentId: '',
            storeId: '',
            share: 1,
            startDate: new Date().toISOString().split('T')[0],
        },
    });

    const watchShare = form.watch('share');
    const watchDenominationId = form.watch('denominationId');

    // Reset form cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            form.reset();
        }
    }, [open, form]);

    // Calcular límite según share
    const getShareLimit = (share: number) => {
        if (share >= 1 && share <= 39) return 100;
        if (share >= 40 && share <= 99) return 300;
        return 0;
    };

    // Calcular total
    const selectedDenomination = denominations?.find(
        (d) => d.denominationId === watchDenominationId
    );
    const weeklyAmount = selectedDenomination?.value || 0;
    const totalAmount = weeklyAmount * 52;

    const onSubmit = async (data: CreateClubForm) => {
        try {
            // Formatear fecha como espera el API
            const formattedDate = `${data.startDate} 00:00:00.000`;

            await createMutation.mutateAsync({
                ...data,
                startDate: formattedDate,
                saaSId: 2, // Valor por defecto según el CURL
            });

            toast({
                title: 'Club creado exitosamente',
                description: `Se ha creado el club con share ${data.share}`,
            });

            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Error al crear club',
                description: error?.message || 'No se pudo crear el club. Intente nuevamente.',
                variant: 'destructive',
            });
        }
    };

    const isLoadingCatalogs = loadingTypes || loadingDenominations || loadingClientes;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Club</DialogTitle>
                    <DialogDescription>
                        Complete los datos para crear un nuevo club
                    </DialogDescription>
                </DialogHeader>

                {isLoadingCatalogs ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">Cargando catálogos...</span>
                    </div>
                ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Cliente */}
                        <div className="space-y-2">
                            <Label htmlFor="customerId">Cliente *</Label>
                            <Select
                                value={form.watch('customerId')}
                                onValueChange={(v) => form.setValue('customerId', v, { shouldValidate: true })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes?.data?.map((cliente) => (
                                        <SelectItem key={cliente.customerId} value={cliente.customerId}>
                                            {cliente.firstName} {cliente.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.customerId && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.customerId.message}
                                </p>
                            )}
                        </div>

                        {/* Tipo de Club y Denominación */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="clubTypeId">Tipo de Club *</Label>
                                <Select
                                    value={form.watch('clubTypeId')}
                                    onValueChange={(v) => form.setValue('clubTypeId', v, { shouldValidate: true })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
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
                                <Label htmlFor="denominationId">Denominación *</Label>
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
                                <Label htmlFor="share">Share (1-99) *</Label>
                                <Input
                                    id="share"
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
                                    Límite disponible: {getShareLimit(watchShare)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...form.register('startDate')}
                                />
                                {form.formState.errors.startDate && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.startDate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Agente y Tienda - TODO: Obtener de catálogos reales */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="salesAgentId">Agente de Ventas *</Label>
                                <Input
                                    id="salesAgentId"
                                    placeholder="ID del agente"
                                    {...form.register('salesAgentId')}
                                />
                                {form.formState.errors.salesAgentId && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.salesAgentId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="storeId">Tienda *</Label>
                                <Input
                                    id="storeId"
                                    placeholder="ID de la tienda"
                                    {...form.register('storeId')}
                                />
                                {form.formState.errors.storeId && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.storeId.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Resumen */}
                        {watchDenominationId && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <h4 className="font-medium text-sm">Resumen del Club</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-gray-500">Pago semanal:</span>
                                    <span className="font-medium">${weeklyAmount}</span>
                                    <span className="text-gray-500">Total (52 semanas):</span>
                                    <span className="font-medium">${totalAmount}</span>
                                    <span className="text-gray-500">Share:</span>
                                    <span className="font-medium">{watchShare}</span>
                                    <span className="text-gray-500">Límite del número:</span>
                                    <span className="font-medium">{getShareLimit(watchShare)}</span>
                                </div>
                            </div>
                        )}

                        {/* Alerta de límites */}
                        {watchShare >= 40 && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Los shares del 40-99 tienen un límite de 300 participantes.
                                </AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Crear Club
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}