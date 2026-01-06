// src/types/tenant.ts

// Respuesta real de CheckCompany de Aludra
export interface AludraCompany {
    SaaSId: number;
    CompanyName: string;
    CustomerURL?: string;
    DataSource?: string;
    InitialCatalog?: string;
    SearchEngine?: string;
    APIMSubscriptionKey?: string;
    AppServiceId?: string;
    // Campos opcionales para branding (si los agregan después)
    Logo?: string;
    PrimaryColor?: string;
    SecondaryColor?: string;
}

export interface TenantBranding {
    logo: string;
    logoSmall?: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
}

export interface TenantConfig {
    id: number;
    companyId: number;
    slug: string;
    name: string;
    tradeName: string;
    branding: TenantBranding;
    status: 'active' | 'suspended' | 'trial';
}

export interface TenantState {
    tenant: TenantConfig | null;
    isLoading: boolean;
    error: string | null;
    isValidated: boolean;
}

// Mapear respuesta de Aludra a TenantConfig
// Data viene como array: Data: [{ SaaSId, CompanyName, ... }]
export const mapAludraCompanyToTenant = (data: AludraCompany | AludraCompany[]): TenantConfig => {
    // Si es array, tomar el primer elemento
    const company = Array.isArray(data) ? data[0] : data;

    if (!company) {
        throw new Error('Datos de compañía inválidos');
    }

    return {
        id: company.SaaSId,
        companyId: company.SaaSId,
        slug: company.CompanyName?.toLowerCase() || '',
        name: company.CompanyName || 'Company',
        tradeName: company.CompanyName || 'Company',
        branding: {
            logo: company.Logo || '',
            logoSmall: '',
            primaryColor: company.PrimaryColor || '#3B82F6',
            secondaryColor: company.SecondaryColor || '#1E40AF',
            accentColor: '#F59E0B',
        },
        status: 'active',
    };
};