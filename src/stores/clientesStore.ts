// src/stores/clientesStore.ts
import { create } from 'zustand';
import type { Cliente, ClienteFilters } from '@/types/clientes';

interface ClientesState {
    // Data
    clientes: Cliente[];
    total: number;
    selectedCliente: Cliente | null;
    selectedIds: string[];

    // Filters & Pagination
    filters: ClienteFilters;
    page: number;
    pageSize: number;

    // UI State
    isLoading: boolean;
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
    isImportModalOpen: boolean;
    isAjustePuntosModalOpen: boolean;

    // Actions - Data
    setClientes: (clientes: Cliente[]) => void;
    setTotal: (total: number) => void;
    addCliente: (cliente: Cliente) => void;
    updateCliente: (id: string, data: Partial<Cliente>) => void;
    removeCliente: (id: string) => void;
    setSelectedCliente: (cliente: Cliente | null) => void;

    // Actions - Selection
    toggleSelection: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clearSelection: () => void;

    // Actions - Filters & Pagination
    setFilters: (filters: ClienteFilters) => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    resetFilters: () => void;

    // Actions - UI
    setLoading: (loading: boolean) => void;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    openEditModal: (cliente: Cliente) => void;
    closeEditModal: () => void;
    openDeleteModal: (cliente: Cliente) => void;
    closeDeleteModal: () => void;
    openImportModal: () => void;
    closeImportModal: () => void;
    openAjustePuntosModal: (cliente: Cliente) => void;
    closeAjustePuntosModal: () => void;
}

const initialFilters: ClienteFilters = {
    search: '',
    status: undefined,
    tipoCliente: undefined,
};

export const useClientesStore = create<ClientesState>((set) => ({
    // Initial Data
    clientes: [],
    total: 0,
    selectedCliente: null,
    selectedIds: [],

    // Initial Filters & Pagination
    filters: initialFilters,
    page: 1,
    pageSize: 10,

    // Initial UI State
    isLoading: false,
    isCreateModalOpen: false,
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    isImportModalOpen: false,
    isAjustePuntosModalOpen: false,

    // Actions - Data
    setClientes: (clientes) => set({ clientes }),
    setTotal: (total) => set({ total }),
    addCliente: (cliente) =>
        set((state) => ({ clientes: [cliente, ...state.clientes] })),
    updateCliente: (id, data) =>
        set((state) => ({
            clientes: state.clientes.map((c) =>
                c.id === id ? { ...c, ...data } : c
            ),
            selectedCliente:
                state.selectedCliente?.id === id
                    ? { ...state.selectedCliente, ...data }
                    : state.selectedCliente,
        })),
    removeCliente: (id) =>
        set((state) => ({
            clientes: state.clientes.filter((c) => c.id !== id),
            selectedIds: state.selectedIds.filter((i) => i !== id),
        })),
    setSelectedCliente: (selectedCliente) => set({ selectedCliente }),

    // Actions - Selection
    toggleSelection: (id) =>
        set((state) => ({
            selectedIds: state.selectedIds.includes(id)
                ? state.selectedIds.filter((i) => i !== id)
                : [...state.selectedIds, id],
        })),
    selectAll: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),

    // Actions - Filters & Pagination
    setFilters: (filters) => set({ filters, page: 1 }),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    resetFilters: () => set({ filters: initialFilters, page: 1 }),

    // Actions - UI
    setLoading: (isLoading) => set({ isLoading }),
    openCreateModal: () => set({ isCreateModalOpen: true }),
    closeCreateModal: () => set({ isCreateModalOpen: false }),
    openEditModal: (cliente) =>
        set({ isEditModalOpen: true, selectedCliente: cliente }),
    closeEditModal: () =>
        set({ isEditModalOpen: false, selectedCliente: null }),
    openDeleteModal: (cliente) =>
        set({ isDeleteModalOpen: true, selectedCliente: cliente }),
    closeDeleteModal: () =>
        set({ isDeleteModalOpen: false, selectedCliente: null }),
    openImportModal: () => set({ isImportModalOpen: true }),
    closeImportModal: () => set({ isImportModalOpen: false }),
    openAjustePuntosModal: (cliente) =>
        set({ isAjustePuntosModalOpen: true, selectedCliente: cliente }),
    closeAjustePuntosModal: () =>
        set({ isAjustePuntosModalOpen: false, selectedCliente: null }),
}));