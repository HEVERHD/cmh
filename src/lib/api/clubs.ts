// ============================================
// API CLIENT - lib/api/clubs.ts
// ============================================


import type {
    Club,
    ClubWithDetails,
    ClubFilters,
    PaginatedClubs,
    CreateClubDTO,
    UpdateClubDTO,
    ClubType,
    ClubStatus,
    Denomination,
    ClubWeek,
    ClubTransaction,
    ClubRule,
    Draw,
    LimitNumber,
} from '@/lib/types/club';
import { apiClient } from './client';

// Base URL para MDL05
const BASE_URL = '/mdl05';

export const clubApi = {
    // ==========================================
    // CRUD Clubes
    // ==========================================
    async getClubs(
        filters: ClubFilters = {},
        page = 1,
        pageSize = 10
    ): Promise<PaginatedClubs> {
        const params = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
            ...Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
            ),
        });
        return apiClient.get(`${BASE_URL}/getClubs?${params}`);
    },

    async getClubById(clubId: string): Promise<ClubWithDetails> {
        return apiClient.get(`${BASE_URL}/getClub/${clubId}`);
    },

    async createClub(data: CreateClubDTO): Promise<Club> {
        // Formato según el CURL proporcionado
        const payload = {
            saaSId: data.saaSId || 2,
            ClubTypeId: data.clubTypeId,
            CustomerId: data.customerId,
            SalesAgentId: data.salesAgentId,
            DenominationId: data.denominationId,
            StoreId: data.storeId,
            Share: data.share,
            StartDate: data.startDate,
        };
        return apiClient.post(`${BASE_URL}/createClub`, payload);
    },

    async updateClub(clubId: string, data: UpdateClubDTO): Promise<Club> {
        return apiClient.patch(`${BASE_URL}/updateClub/${clubId}`, data);
    },

    async deleteClub(clubId: string): Promise<void> {
        return apiClient.delete(`${BASE_URL}/deleteClub/${clubId}`);
    },

    // ==========================================
    // Semanas del Club
    // ==========================================
    async getClubWeeks(clubId: string): Promise<ClubWeek[]> {
        return apiClient.get(`${BASE_URL}/getClubWeeks/${clubId}`);
    },

    async payWeek(
        clubId: string,
        weekNumber: number,
        amount: number
    ): Promise<ClubWeek> {
        return apiClient.post(`${BASE_URL}/payClubWeek`, {
            clubId,
            weekNumber,
            amount,
        });
    },

    // ==========================================
    // Transacciones
    // ==========================================
    async getClubTransactions(clubId: string): Promise<ClubTransaction[]> {
        return apiClient.get(`${BASE_URL}/getClubTransactions/${clubId}`);
    },

    async createTransaction(
        clubId: string,
        data: Partial<ClubTransaction>
    ): Promise<ClubTransaction> {
        return apiClient.post(`${BASE_URL}/createClubTransaction`, {
            clubId,
            ...data,
        });
    },

    // ==========================================
    // Catálogos
    // ==========================================
    async getClubTypes(): Promise<ClubType[]> {
        return apiClient.get(`${BASE_URL}/getClubTypes`);
    },

    async getClubStatuses(): Promise<ClubStatus[]> {
        return apiClient.get(`${BASE_URL}/getClubStatuses`);
    },

    async getDenominations(): Promise<Denomination[]> {
        return apiClient.get(`${BASE_URL}/getDenominations`);
    },

    async getTransactionTypes(): Promise<any[]> {
        return apiClient.get(`${BASE_URL}/getTransactionTypes`);
    },

    // ==========================================
    // Reglas del Club
    // ==========================================
    async getClubRules(): Promise<ClubRule[]> {
        return apiClient.get(`${BASE_URL}/getClubRules`);
    },

    async createRule(data: Partial<ClubRule>): Promise<ClubRule> {
        return apiClient.post(`${BASE_URL}/createClubRule`, data);
    },

    async updateRule(ruleId: string, data: Partial<ClubRule>): Promise<ClubRule> {
        return apiClient.patch(`${BASE_URL}/updateClubRule/${ruleId}`, data);
    },

    async deleteRule(ruleId: string): Promise<void> {
        return apiClient.delete(`${BASE_URL}/deleteClubRule/${ruleId}`);
    },

    // ==========================================
    // Sorteos (Draws)
    // ==========================================
    async getDraws(
        clubTypeId?: string,
        dateFrom?: string,
        dateTo?: string
    ): Promise<Draw[]> {
        const params = new URLSearchParams();
        if (clubTypeId) params.append('clubTypeId', clubTypeId);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        return apiClient.get(`${BASE_URL}/getDraws?${params}`);
    },

    async registerDraw(data: {
        date: string;
        numberPlayed: number;
        clubTypeId: string;
    }): Promise<Draw> {
        return apiClient.post(`${BASE_URL}/registerDraw`, data);
    },

    async updateDraw(drawId: string, data: Partial<Draw>): Promise<Draw> {
        return apiClient.patch(`${BASE_URL}/updateDraw/${drawId}`, data);
    },

    // ==========================================
    // Límites de Números (1-39: 100, 40-99: 300)
    // ==========================================
    async getLimitNumbers(): Promise<LimitNumber[]> {
        return apiClient.get(`${BASE_URL}/getLimitNumbers`);
    },

    async updateLimitNumber(number: number, limit: number): Promise<LimitNumber> {
        return apiClient.patch(`${BASE_URL}/updateLimitNumber/${number}`, { limit });
    },

    // ==========================================
    // Historial y Auditoría
    // ==========================================
    async getClubHistory(clubId: string): Promise<any[]> {
        return apiClient.get(`${BASE_URL}/getClubHistory/${clubId}`);
    },

    async getClubChangeHistory(clubId: string): Promise<any[]> {
        return apiClient.get(`${BASE_URL}/getClubChangeHistory/${clubId}`);
    },

    // ==========================================
    // Utilidades
    // ==========================================
    async searchByContract(contractNumber: string): Promise<Club[]> {
        return apiClient.get(`${BASE_URL}/searchClub?contractNumber=${contractNumber}`);
    },

    async getClubStats(clubId: string): Promise<{
        totalPaid: number;
        totalPending: number;
        weeksOnTime: number;
        weeksLate: number;
    }> {
        return apiClient.get(`${BASE_URL}/getClubStats/${clubId}`);
    },

    async exportClubs(
        filters: ClubFilters,
        format: 'csv' | 'xlsx' = 'xlsx'
    ): Promise<Blob> {
        const params = new URLSearchParams({
            format,
            ...Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== undefined)
            ),
        });
        return apiClient.getBlob(`${BASE_URL}/exportClubs?${params}`);
    },
};