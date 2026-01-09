// src/stores/tenant-store.ts

import { create } from 'zustand';
import { checkCompany, getErrorMessage } from '@/lib/api/client';
import type { TenantConfig, TenantState, AludraCompany } from '@/types/tenant';
import { mapAludraCompanyToTenant } from '@/types/tenant';

interface TenantStore extends TenantState {
    validateCompany: (companyName: string) => Promise<TenantConfig>;
    setTenant: (tenant: TenantConfig) => void;
    clearTenant: () => void;
    clearError: () => void;
}

export const useTenantStore = create<TenantStore>()((set) => ({
    tenant: null,
    isLoading: false,
    error: null,
    isValidated: false,

    validateCompany: async (companyName: string) => {
        set({ isLoading: true, error: null });

        try {
            // checkCompany ya tiene todas las validaciones y lanza error si falla
            const companyData = await checkCompany(companyName);

            const tenant = mapAludraCompanyToTenant(companyData as AludraCompany);

            set({
                tenant,
                isLoading: false,
                error: null,
                isValidated: true,
            });

            return tenant;

        } catch (error) {
            const message = error instanceof Error ? error.message : getErrorMessage(error);

            set({
                tenant: null,
                isLoading: false,
                error: message,
                isValidated: false,
            });

            throw error;
        }
    },

    setTenant: (tenant: TenantConfig) => {
        set({ tenant, isLoading: false, error: null, isValidated: true });
    },

    clearTenant: () => {
        set({ tenant: null, isLoading: false, error: null, isValidated: false });
    },

    clearError: () => set({ error: null }),
}));