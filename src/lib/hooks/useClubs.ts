// ============================================
// HOOKS - lib/hooks/useClubs.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clubApi } from '@/lib/api/clubs';
import {
    ClubFilters, ClubRule, CreateClubDTO, UpdateClubDTO,
    PaymentMethodFilters, CreatePaymentMethodDTO, UpdatePaymentMethodDTO
} from '@/types/club';


// ==========================================
// Query Keys para cache
// ==========================================
export const clubKeys = {
    all: ['clubs'] as const,
    lists: () => [...clubKeys.all, 'list'] as const,
    list: (filters: ClubFilters, page: number, pageSize: number) =>
        [...clubKeys.lists(), { filters, page, pageSize }] as const,
    details: () => [...clubKeys.all, 'detail'] as const,
    detail: (id: string) => [...clubKeys.details(), id] as const,
    weeks: (clubId: string) => [...clubKeys.all, 'weeks', clubId] as const,
    transactions: (clubId: string) =>
        [...clubKeys.all, 'transactions', clubId] as const,
    history: (clubId: string) => [...clubKeys.all, 'history', clubId] as const,
    stats: (clubId: string) => [...clubKeys.all, 'stats', clubId] as const,
    // Catálogos
    types: ['club-types'] as const,
    statuses: ['club-statuses'] as const,
    denominations: ['denominations'] as const,
    transactionTypes: ['transaction-types'] as const,
    // Reglas y configuración
    rules: ['club-rules'] as const,
    limits: ['limit-numbers'] as const,
    // Sorteos
    draws: (clubTypeId?: string, dateFrom?: string, dateTo?: string) =>
        ['draws', { clubTypeId, dateFrom, dateTo }] as const,
    // Formas de Pago
    paymentMethods: (clubId: string, filters?: PaymentMethodFilters) =>
        ['payment-methods', clubId, filters] as const,
    paymentMethod: (paymentMethodId: string) =>
        ['payment-method', paymentMethodId] as const,
};

// ==========================================
// Hooks para Clubes
// ==========================================

// Listar clubes con filtros y paginación
// Reemplaza esta función:
export function useClubs(
    filters: ClubFilters = {},
    page = 1,
    pageSize = 10,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: clubKeys.list(filters, page, pageSize),
        queryFn: () => clubApi.getClubs(filters, page, pageSize),
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 30 * 60 * 1000, // 30 minutos en caché
        placeholderData: (prev) => prev,
        retry: 1,
        refetchOnWindowFocus: false,
        enabled: options?.enabled ?? true,
    });
}
// Obtener un club por ID
export function useClub(clubId: string) {
    return useQuery({
        queryKey: clubKeys.detail(clubId),
        queryFn: () => clubApi.getClubById(clubId),
        enabled: !!clubId,
    });
}

// Semanas del club
export function useClubWeeks(clubId: string) {
    return useQuery({
        queryKey: clubKeys.weeks(clubId),
        queryFn: () => clubApi.getClubWeeks(clubId),
        enabled: !!clubId,
    });
}

// Transacciones del club
export function useClubTransactions(clubId: string) {
    return useQuery({
        queryKey: clubKeys.transactions(clubId),
        queryFn: () => clubApi.getClubTransactions(clubId),
        enabled: !!clubId,
    });
}

// Historial del club
export function useClubHistory(clubId: string) {
    return useQuery({
        queryKey: clubKeys.history(clubId),
        queryFn: () => clubApi.getClubHistory(clubId),
        enabled: !!clubId,
    });
}

// Estadísticas del club
export function useClubStats(clubId: string) {
    return useQuery({
        queryKey: clubKeys.stats(clubId),
        queryFn: () => clubApi.getClubStats(clubId),
        enabled: !!clubId,
    });
}

// ==========================================
// Hooks para Catálogos
// ==========================================

// Tipos de club (Miércoles, Domingo, Combinado)
export function useClubTypes() {
    return useQuery({
        queryKey: clubKeys.types,
        queryFn: () => clubApi.getClubTypes(),
        staleTime: Infinity, // No cambian frecuentemente
    });
}

// Estados de club (Activo, Anulado, Cerrado, En Auditoría)
export function useClubStatuses() {
    return useQuery({
        queryKey: clubKeys.statuses,
        queryFn: () => clubApi.getClubStatuses(),
        staleTime: Infinity,
    });
}

// Denominaciones ($3, $4, $10)
export function useDenominations() {
    return useQuery({
        queryKey: clubKeys.denominations,
        queryFn: () => clubApi.getDenominations(),
        staleTime: Infinity,
    });
}

// Tipos de transacción (Pago, Retiro, Comisión, Premiación)
export function useTransactionTypes() {
    return useQuery({
        queryKey: clubKeys.transactionTypes,
        queryFn: () => clubApi.getTransactionTypes(),
        staleTime: Infinity,
    });
}

// ==========================================
// Hooks para Reglas
// ==========================================

export function useClubRules() {
    return useQuery({
        queryKey: clubKeys.rules,
        queryFn: () => clubApi.getClubRules(),
        staleTime: 300000, // 5 minutos
    });
}

// ==========================================
// Hooks para Límites de Números
// ==========================================

export function useLimitNumbers() {
    return useQuery({
        queryKey: clubKeys.limits,
        queryFn: () => clubApi.getLimitNumbers(),
        staleTime: Infinity,
    });
}

// ==========================================
// Hooks para Sorteos
// ==========================================

export function useDraws() {
    return useQuery({
        queryKey: ['draws'],
        queryFn: () => clubApi.getDraws(),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

// ==========================================
// Mutations para Clubes
// ==========================================

// Crear club
export function useCreateClub() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateClubDTO) => clubApi.createClub(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
        },
    });
}

// Actualizar club
export function useUpdateClub() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ clubId, data }: { clubId: string; data: UpdateClubDTO }) =>
            clubApi.updateClub(clubId, data),
        onSuccess: (_, { clubId }) => {
            queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
            queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
        },
    });
}

// Eliminar club
export function useDeleteClub() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (clubId: string) => clubApi.deleteClub(clubId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
        },
    });
}

// ==========================================
// Mutations para Semanas
// ==========================================

// Pagar semana
export function usePayWeek() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            clubId,
            weekNumber,
            amount,
        }: {
            clubId: string;
            weekNumber: number;
            amount: number;
        }) => clubApi.payWeek(clubId, weekNumber, amount),
        onSuccess: (_, { clubId }) => {
            queryClient.invalidateQueries({ queryKey: clubKeys.weeks(clubId) });
            queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
            queryClient.invalidateQueries({ queryKey: clubKeys.transactions(clubId) });
            queryClient.invalidateQueries({ queryKey: clubKeys.stats(clubId) });
        },
    });
}

// ==========================================
// Mutations para Transacciones
// ==========================================

export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            clubId,
            data,
        }: {
            clubId: string;
            data: Parameters<typeof clubApi.createTransaction>[1];
        }) => clubApi.createTransaction(clubId, data),
        onSuccess: (_, { clubId }) => {
            queryClient.invalidateQueries({ queryKey: clubKeys.transactions(clubId) });
            queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
        },
    });
}

// ==========================================
// Mutations para Reglas
// ==========================================

export function useCreateRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<ClubRule>) => clubApi.createRule(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clubKeys.rules });
        },
    });
}

export function useUpdateRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ruleId, data }: { ruleId: string; data: Partial<ClubRule> }) =>
            clubApi.updateRule(ruleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clubKeys.rules });
        },
    });
}

export function useDeleteRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ruleId: string) => clubApi.deleteRule(ruleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clubKeys.rules });
        },
    });
}

// ==========================================
// Mutations para Sorteos
// ==========================================

export function useRegisterDraw() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { date: string; numberPlayed: number; clubTypeId: string }) =>
            clubApi.registerDraw(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['draws'] });
        },
    });
}

export function useUpdateDraw() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ drawId, data }: { drawId: string; data: Parameters<typeof clubApi.updateDraw>[1] }) =>
            clubApi.updateDraw(drawId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['draws'] });
        },
    });
}

// ==========================================
// Mutations para Límites
// ==========================================

export function useUpdateLimitNumber() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ number, limit }: { number: number; limit: number }) =>
            clubApi.updateLimitNumber(number, limit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clubKeys.limits });
        },
    });
}

// ==========================================
// Hooks para Formas de Pago
// ==========================================

// Obtener todas las formas de pago de un club
export function usePaymentMethods(clubId: string, filters?: PaymentMethodFilters) {
    return useQuery({
        queryKey: clubKeys.paymentMethods(clubId, filters),
        queryFn: () => clubApi.getPaymentMethods(clubId, filters),
        enabled: !!clubId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

// Obtener una forma de pago específica
export function usePaymentMethod(paymentMethodId: string) {
    return useQuery({
        queryKey: clubKeys.paymentMethod(paymentMethodId),
        queryFn: () => clubApi.getPaymentMethod(paymentMethodId),
        enabled: !!paymentMethodId,
    });
}

// ==========================================
// Mutations para Formas de Pago
// ==========================================

// Crear forma de pago
export function useCreatePaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePaymentMethodDTO) => clubApi.createPaymentMethod(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: clubKeys.paymentMethods(variables.clubId),
            });
        },
    });
}

// Actualizar forma de pago
export function useUpdatePaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            paymentMethodId,
            data,
        }: {
            paymentMethodId: string;
            data: UpdatePaymentMethodDTO;
        }) => clubApi.updatePaymentMethod(paymentMethodId, data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({
                queryKey: clubKeys.paymentMethods(result.clubId),
            });
            queryClient.invalidateQueries({
                queryKey: clubKeys.paymentMethod(result.paymentMethodId),
            });
        },
    });
}

// Eliminar forma de pago
export function useDeletePaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ paymentMethodId, clubId }: { paymentMethodId: string; clubId: string }) =>
            clubApi.deletePaymentMethod(paymentMethodId),
        onSuccess: (_, { clubId }) => {
            queryClient.invalidateQueries({
                queryKey: clubKeys.paymentMethods(clubId),
            });
        },
    });
}

// Establecer forma de pago por defecto
export function useSetDefaultPaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            clubId,
            paymentMethodId,
        }: {
            clubId: string;
            paymentMethodId: string;
        }) => clubApi.setDefaultPaymentMethod(clubId, paymentMethodId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: clubKeys.paymentMethods(variables.clubId),
            });
        },
    });
}