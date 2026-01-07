// src/lib/hooks/useClientes.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { clientesApi, clientesKeys } from '@/lib/api/clientes';
import { useDebouncedValue } from './useDebounce';


interface UseClientesOptions {
    initialPage?: number;
    pageSize?: number;
    enabled?: boolean;
}

/**
 * Hook principal para listar clientes con paginación del servidor
 */
export function useClientes(
    filters: { search?: string; customerTypeId?: string; categoryId?: string } = {},
    page = 1,
    pageSize = 10,
    options: UseClientesOptions = {}
) {
    const { enabled = true } = options;

    // Debounce search para no hacer requests en cada tecla
    const debouncedSearch = useDebouncedValue(filters.search || '', 400);

    const queryFilters = useMemo(() => ({
        ...filters,
        search: debouncedSearch,
    }), [filters.customerTypeId, filters.categoryId, debouncedSearch]);

    return useQuery({
        queryKey: clientesKeys.list(queryFilters, page, pageSize),
        queryFn: () => clientesApi.getAll(queryFilters, page, pageSize),
        enabled,
        staleTime: 30 * 1000, // 30 segundos - datos frescos
        gcTime: 5 * 60 * 1000, // 5 minutos en cache
        placeholderData: (prev) => prev, // Mantener datos previos mientras carga
    });
}

/**
 * Hook para búsqueda en select/autocomplete
 * Optimizado para cargar solo cuando el usuario escribe
 */
export function useClientesSearch(searchTerm: string) {
    const debouncedTerm = useDebouncedValue(searchTerm, 300);

    return useQuery({
        queryKey: clientesKeys.search(debouncedTerm),
        queryFn: () => clientesApi.searchForSelect(debouncedTerm),
        enabled: debouncedTerm.length >= 2,
        staleTime: 60 * 1000, // 1 minuto
        gcTime: 5 * 60 * 1000,
    });
}

/**
 * Hook para obtener un cliente específico
 */
export function useCliente(id: string | null) {
    return useQuery({
        queryKey: clientesKeys.detail(id || ''),
        queryFn: () => clientesApi.getById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook con estado de paginación integrado
 */
export function useClientesPaginated(initialFilters = {}, initialPageSize = 10) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [filters, setFilters] = useState(initialFilters);

    const query = useClientes(filters, page, pageSize);

    const goToPage = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const updateFilters = useCallback((newFilters: typeof filters) => {
        setFilters(newFilters);
        setPage(1); // Reset a página 1 al filtrar
    }, []);

    const updateSearch = useCallback((search: string) => {
        setFilters(prev => ({ ...prev, search }));
        setPage(1);
    }, []);

    return {
        ...query,
        page,
        pageSize,
        filters,
        setPage: goToPage,
        setPageSize,
        setFilters: updateFilters,
        setSearch: updateSearch,
        // Helpers
        hasNextPage: query.data ? page < query.data.totalPages : false,
        hasPrevPage: page > 1,
        nextPage: () => goToPage(page + 1),
        prevPage: () => goToPage(page - 1),
    };
}