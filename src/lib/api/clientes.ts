// src/lib/api/clientes.ts
import { apiClient } from './client';

// Respuesta del API
interface CustomerData {
    TotalRegisters: number;
    RowNumber: number;
    SaaSId: number;
    CustomerId: string;
    FullName?: string;
    Email?: string;
    PhoneNumber?: string;
    NumberId?: string;
    CustomerTypeName?: string;
    CustomerStatusName?: string;
    TierName?: string;
    TierImageUrl?: string;
    CreatedDate?: string;
}

interface SearchCustomersResponse {
    Data: CustomerData[];
    Status: { Code: number; Message: string };
}

// Cliente transformado para la UI
export interface Cliente {
    id: string;
    customerId: string;
    fullName: string;
    email: string;
    phone: string;
    identificationNumber: string;
    customerType: string;
    status: string;
    tier: string;
    tierImage: string;
    createdAt: string;
}

export const clientesKeys = {
    all: ['clientes'] as const,
    lists: () => [...clientesKeys.all, 'list'] as const,
    list: (filters: any, page: number, pageSize: number) =>
        [...clientesKeys.lists(), { filters, page, pageSize }] as const,
    search: (term: string) => [...clientesKeys.all, 'search', term] as const,
    detail: (id: string) => [...clientesKeys.all, 'detail', id] as const,
};

// Transformar datos del API al formato de UI
const transformCliente = (c: CustomerData): Cliente => ({
    id: c.CustomerId,
    customerId: c.CustomerId,
    fullName: c.FullName?.trim() || 'Sin nombre',
    email: c.Email || '',
    phone: c.PhoneNumber || '',
    identificationNumber: c.NumberId || '',
    customerType: c.CustomerTypeName || '',
    status: c.CustomerStatusName || '',
    tier: c.TierName || '',
    tierImage: c.TierImageUrl || '',
    createdAt: c.CreatedDate || '',
});

export const clientesApi = {
    /**
     * Buscar clientes con paginación del servidor
     * IMPORTANTE: Siempre usar pageSize pequeño (10-25) para rendimiento
     */
    async getAll(filters: any = {}, page = 1, pageSize = 10) {
        // Limitar pageSize para evitar cargar demasiados datos
        const safePageSize = Math.min(pageSize, 25);

        const payload = {
            SaaSId: 2,
            CompanyId: null,
            CompanyCode: null,
            GlobalExecution: true,
            SearchText: filters.search?.trim() || null,
            CustomerTypeId: filters.customerTypeId || null,
            CustomerCategoryId: filters.categoryId || null,
            AludraAPP: true,
            RoleName: "CUSTOMER",
            PageNumber: page,
            PageSize: safePageSize,
        };

        console.log('🔍 Buscando clientes:', { page, pageSize: safePageSize, search: filters.search });

        const { data: response } = await apiClient.post<SearchCustomersResponse>(
            '/mdl03/SearchCustomers/Post',
            payload
        );

        if (!response?.Data) {
            throw new Error('Respuesta inválida del servidor');
        }

        const clientes = response.Data.map(transformCliente);
        const total = response.Data[0]?.TotalRegisters || 0;

        console.log(`✅ Clientes: ${clientes.length} de ${total.toLocaleString()}`);

        return {
            data: clientes,
            total,
            page,
            pageSize: safePageSize,
            totalPages: Math.ceil(total / safePageSize),
        };
    },

    /**
     * Búsqueda rápida para autocomplete/select
     * Retorna máximo 20 resultados
     */
    async searchForSelect(searchText: string) {
        if (!searchText || searchText.length < 2) {
            return [];
        }

        const payload = {
            SaaSId: 2,
            CompanyId: null,
            CompanyCode: null,
            GlobalExecution: true,
            SearchText: searchText.trim(),
            CustomerTypeId: null,
            CustomerCategoryId: null,
            AludraAPP: true,
            RoleName: "CUSTOMER",
            PageNumber: 1,
            PageSize: 20, // Solo necesitamos pocos para el dropdown
        };

        const { data: response } = await apiClient.post<SearchCustomersResponse>(
            '/mdl03/SearchCustomers/Post',
            payload
        );

        return (response?.Data || []).map(c => ({
            value: c.CustomerId,
            label: c.FullName?.trim() || 'Sin nombre',
            email: c.Email,
            phone: c.PhoneNumber,
        }));
    },

    /**
     * Obtener un cliente por ID
     */
    async getById(id: string) {
        // Buscar por ID específico si el API lo soporta
        // Por ahora, buscar con el ID como texto
        const payload = {
            SaaSId: 2,
            CompanyId: null,
            CompanyCode: null,
            GlobalExecution: true,
            SearchText: id,
            CustomerTypeId: null,
            CustomerCategoryId: null,
            AludraAPP: true,
            RoleName: "CUSTOMER",
            PageNumber: 1,
            PageSize: 1,
        };

        const { data: response } = await apiClient.post<SearchCustomersResponse>(
            '/mdl03/SearchCustomers/Post',
            payload
        );

        const cliente = response?.Data?.[0];
        return cliente ? transformCliente(cliente) : null;
    },
};