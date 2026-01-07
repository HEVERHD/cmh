// src/lib/data/mockData.ts
// IDs extraídos del CURL que funciona - TEMPORALES hasta obtener catálogos completos

export const DEFAULT_VALUES = {
    saaSId: 2,
    salesAgentId: '89D7A9C0-DA6A-454A-A2AC-325B373D8885',
    storeId: '9BE47D58-1B51-419C-8A84-6E3FD435650F',
};

// Tipos de Club - Solo 1 confirmado por ahora
export const mockClubTypes = [
    {
        clubTypeId: '1A04396C-CC15-4BD1-912D-7975E5130CF7',
        name: 'Club Navideño',
        description: 'Club de ahorro navideño',
        weeksCount: 52,
        active: true,
    },
];

// Denominaciones - Solo 1 confirmada por ahora
export const mockDenominations = [
    {
        denominationId: '95EEA86E-A596-43C7-96FF-4FE2FA793D3F',
        value: 5,
        description: '$5.00 semanal',
        active: true,
    },
];

// Estados de Club
export const mockClubStatuses = [
    {
        clubStatusId: '42748F33-71C3-42B4-B73E-47C27F1E61DF',
        name: 'Activo',
        description: 'Club activo en el sistema',
        active: true,
    },
];

// Clientes mock (fallback)
export const mockClientes = [
    {
        customerId: '663E9341-B3AC-4EAE-86FB-5BF1A5EAC8A6',
        firstName: 'Cliente',
        lastName: 'Demo',
        email: 'demo@example.com',
        phone: '+507 6000-0001',
        identificationNumber: '8-800-1234',
    },
];