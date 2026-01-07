// src/lib/api/clientes.ts
import { apiClient } from './client';
import type {
    Cliente,
    ClienteFilters,
    CreateClienteDTO,
    UpdateClienteDTO,
    AjustePuntosDTO,
    PaginatedClientes,
} from '@/types/clientes';

export const clientesKeys = {
    all: ['clientes'] as const,
    lists: () => [...clientesKeys.all, 'list'] as const,
    list: (filters: ClienteFilters, page: number, pageSize: number) =>
        [...clientesKeys.lists(), { filters, page, pageSize }] as const,
    details: () => [...clientesKeys.all, 'detail'] as const,
    detail: (id: string) => [...clientesKeys.details(), id] as const,
    historial: (id: string) => [...clientesKeys.all, 'historial', id] as const,
    puntos: (id: string) => [...clientesKeys.all, 'puntos', id] as const,
    stats: () => [...clientesKeys.all, 'stats'] as const,
};

// TODO: Reemplazar con endpoints reales
const BASE_URL = '/clientes';

// Función para verificar compañía/tenant
export async function checkCompany(companyId: string): Promise<{ valid: boolean; name?: string }> {
    try {
        const response = await apiClient.get<{ valid: boolean; name?: string }>(
            `/companies/${companyId}/check`
        );
        return response;
    } catch (error) {
        return { valid: false };
    }
}

// Función para obtener mensaje de error
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Ha ocurrido un error inesperado';
}

export const clientesApi = {
    // CRUD básico
    async getAll(
        filters: ClienteFilters,
        page = 1,
        pageSize = 10
    ): Promise<PaginatedClientes> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            ...Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
            ),
        });
        return apiClient.get(`${BASE_URL}?${params}`);
    },

    async getById(id: string): Promise<Cliente> {
        return apiClient.get(`${BASE_URL}/${id}`);
    },

    async create(data: CreateClienteDTO): Promise<Cliente> {
        return apiClient.post(BASE_URL, data);
    },

    async update(id: string, data: UpdateClienteDTO): Promise<Cliente> {
        return apiClient.patch(`${BASE_URL}/${id}`, data);
    },

    async delete(id: string): Promise<void> {
        return apiClient.delete(`${BASE_URL}/${id}`);
    },

    // Operaciones masivas
    async bulkUpdateStatus(
        ids: string[],
        status: Cliente['status']
    ): Promise<{ updated: number }> {
        return apiClient.post(`${BASE_URL}/bulk-status`, { ids, status });
    },

    // Historial y puntos
    async getHistorialCompras(clienteId: string, page = 1) {
        return apiClient.get(`${BASE_URL}/${clienteId}/historial?page=${page}`);
    },

    async getMovimientosPuntos(clienteId: string, page = 1) {
        return apiClient.get(`${BASE_URL}/${clienteId}/puntos?page=${page}`);
    },

    async ajustarPuntos(data: AjustePuntosDTO) {
        return apiClient.post(`${BASE_URL}/${data.clienteId}/ajustar-puntos`, data);
    },

    // Estadísticas
    async getStats() {
        return apiClient.get(`${BASE_URL}/stats`);
    },

    // Import/Export
    async import(file: File): Promise<{ imported: number; errors: any[] }> {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.postForm(`${BASE_URL}/import`, formData);
    },

    async exportar(filters: ClienteFilters, formato: 'csv' | 'xlsx'): Promise<Blob> {
        const params = new URLSearchParams({
            formato,
            ...Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== undefined)
            ),
        });
        return apiClient.getBlob(`${BASE_URL}/export?${params}`);
    },
};