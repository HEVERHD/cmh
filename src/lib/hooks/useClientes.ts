// lib/hooks/useClientes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi, clientesKeys } from '@/lib/api/clientes';
import { useClientesStore } from '@/stores/clientesStore';
import {
    ClienteFilters, CreateClienteDTO, UpdateClienteDTO,
    AjustePuntosDTO, Cliente
} from '@/types/clientes';
import { toast } from 'sonner';

// Hook principal para listar clientes
export function useClientes(
    filters: ClienteFilters,
    page: number,
    pageSize: number
) {
    const { setClientes, setTotal, setLoading } = useClientesStore();

    return useQuery({
        queryKey: clientesKeys.list(filters, page, pageSize),
        queryFn: async () => {
            setLoading(true);
            try {
                const result = await clientesApi.getAll(filters, page, pageSize);
                setClientes(result.data);
                setTotal(result.total);
                return result;
            } finally {
                setLoading(false);
            }
        },
        staleTime: 30 * 1000, // 30 segundos
    });
}

// Hook para obtener un cliente por ID
export function useCliente(id: string | null) {
    return useQuery({
        queryKey: clientesKeys.detail(id!),
        queryFn: () => clientesApi.getById(id!),
        enabled: !!id,
    });
}

// Hook para crear cliente
export function useCreateCliente() {
    const queryClient = useQueryClient();
    const { addCliente, closeCreateModal } = useClientesStore();

    return useMutation({
        mutationFn: (data: CreateClienteDTO) => clientesApi.create(data),
        onSuccess: (newCliente) => {
            addCliente(newCliente);
            queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
            queryClient.invalidateQueries({ queryKey: clientesKeys.stats() });
            closeCreateModal();
            toast.success('Cliente creado exitosamente');
        },
        onError: (error: Error) => {
            toast.error(`Error al crear cliente: ${error.message}`);
        },
    });
}

// Hook para actualizar cliente
export function useUpdateCliente() {
    const queryClient = useQueryClient();
    const { updateCliente, closeEditModal } = useClientesStore();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateClienteDTO }) =>
            clientesApi.update(id, data),
        onSuccess: (updated) => {
            updateCliente(updated.id, updated);
            queryClient.invalidateQueries({ queryKey: clientesKeys.detail(updated.id) });
            queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
            closeEditModal();
            toast.success('Cliente actualizado');
        },
        onError: (error: Error) => {
            toast.error(`Error al actualizar: ${error.message}`);
        },
    });
}

// Hook para eliminar cliente
export function useDeleteCliente() {
    const queryClient = useQueryClient();
    const { removeCliente } = useClientesStore();

    return useMutation({
        mutationFn: (id: string) => clientesApi.delete(id),
        onSuccess: (_, id) => {
            removeCliente(id);
            queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
            queryClient.invalidateQueries({ queryKey: clientesKeys.stats() });
            toast.success('Cliente eliminado');
        },
        onError: (error: Error) => {
            toast.error(`Error al eliminar: ${error.message}`);
        },
    });
}

// Hook para cambio masivo de status
export function useBulkUpdateStatus() {
    const queryClient = useQueryClient();
    const { clearSelection } = useClientesStore();

    return useMutation({
        mutationFn: ({ ids, status }: { ids: string[]; status: Cliente['status'] }) =>
            clientesApi.bulkUpdateStatus(ids, status),
        onSuccess: ({ updated }) => {
            queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
            clearSelection();
            toast.success(`${updated} clientes actualizados`);
        },
        onError: (error: Error) => {
            toast.error(`Error: ${error.message}`);
        },
    });
}

// Hook para historial de compras
export function useHistorialCompras(clienteId: string | null, page = 1) {
    return useQuery({
        queryKey: clientesKeys.historial(clienteId!),
        queryFn: () => clientesApi.getHistorialCompras(clienteId!, page),
        enabled: !!clienteId,
    });
}

// Hook para movimientos de puntos
export function useMovimientosPuntos(clienteId: string | null, page = 1) {
    return useQuery({
        queryKey: clientesKeys.puntos(clienteId!),
        queryFn: () => clientesApi.getMovimientosPuntos(clienteId!, page),
        enabled: !!clienteId,
    });
}

// Hook para ajustar puntos
export function useAjustarPuntos() {
    const queryClient = useQueryClient();
    const { closeAjustePuntosModal, updateCliente } = useClientesStore();

    return useMutation({
        mutationFn: (data: AjustePuntosDTO) => clientesApi.ajustarPuntos(data),
        onSuccess: (movimiento) => {
            updateCliente(movimiento.clienteId, {
                puntosDisponibles: movimiento.saldoNuevo,
            });
            queryClient.invalidateQueries({
                queryKey: clientesKeys.detail(movimiento.clienteId)
            });
            queryClient.invalidateQueries({
                queryKey: clientesKeys.puntos(movimiento.clienteId)
            });
            closeAjustePuntosModal();
            toast.success('Puntos ajustados correctamente');
        },
        onError: (error: Error) => {
            toast.error(`Error: ${error.message}`);
        },
    });
}

// Hook para estadísticas
export function useClientesStats() {
    return useQuery({
        queryKey: clientesKeys.stats(),
        queryFn: () => clientesApi.getStats(),
        staleTime: 60 * 1000, // 1 minuto
    });
}

// Hook para importar
export function useImportClientes() {
    const queryClient = useQueryClient();
    const { closeImportModal } = useClientesStore();

    return useMutation({
        mutationFn: clientesApi.import,
        onSuccess: ({ imported, errors }) => {
            queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
            queryClient.invalidateQueries({ queryKey: clientesKeys.stats() });
            closeImportModal();
            if (errors.length > 0) {
                toast.warning(`${imported} importados, ${errors.length} errores`);
            } else {
                toast.success(`${imported} clientes importados`);
            }
        },
        onError: (error: Error) => {
            toast.error(`Error al importar: ${error.message}`);
        },
    });
}

// Hook para exportar
export function useExportClientes() {
    return useMutation({
        mutationFn: async ({
            filters,
            formato
        }: {
            filters: ClienteFilters;
            formato: 'csv' | 'xlsx'
        }) => {
            const blob = await clientesApi.exportar(filters, formato);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clientes.${formato}`;
            a.click();
            window.URL.revokeObjectURL(url);
        },
        onSuccess: () => {
            toast.success('Exportación completada');
        },
        onError: (error: Error) => {
            toast.error(`Error al exportar: ${error.message}`);
        },
    });
}