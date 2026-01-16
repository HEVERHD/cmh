// src/lib/api/clubs.ts
import { mdl05Client } from './client';
import { mockClubTypes, mockDenominations, mockClubStatuses } from '@/lib/data/mockData';
import type {
    Club, ClubFilters, PaginatedClubs, CreateClubDTO, UpdateClubDTO,
    ClubType, ClubStatus, Denomination, ClubWeek, ClubTransaction, ClubRule, Draw, LimitNumber,
    ClubPaymentMethod, CreatePaymentMethodDTO, UpdatePaymentMethodDTO, PaymentMethodFilters,
} from '@/types/club';

const BASE_URL = '/mdl05';

export const clubApi = {
    // ==========================================
    // Listar Clubes
    // ==========================================
    async getClubs(filters: ClubFilters = {}, page = 1, pageSize = 20): Promise<PaginatedClubs> {
        try {
            const payload = {
                SearchText: filters.search || null,
                PageNumber: page,
                PageSize: pageSize,
                Status: filters.statusName || null,
            };

            console.log('🔍 Buscando clubes:', payload);

            const { data: response } = await mdl05Client.post(`${BASE_URL}/club/history`, payload);

            console.log('📦 Respuesta clubes:', response);

            const dataArray = response.Data || response || [];

            // Mapear con los campos EXACTOS que vienen del API
            const clubs: Club[] = dataArray.map((c: any) => ({
                clubId: c.ClubId,
                contractNumber: c.ContractNumber || '',
                customerId: c.CustomerId || '',
                customerName: c.CustomerName || 'Sin nombre',
                customerNumber: c.CustomerNumber || '',
                externalCode: c.ExternalCode || '',
                clubTypeId: c.ClubTypeId || '',
                denominationId: c.DenominationId || '',
                clubStatusId: c.ClubStatusId || '',
                statusName: c.NameStatus || 'Desconocido',
                salesAgentId: c.SalesAgentId || '',
                storeId: c.StoreId || '',
                saaSId: c.SaaSId || 2,
                share: c.Share || 0,
                weeksPlayed: 52,
                weeksPaid: c.WeeksPaid || 0,
                weeksLate: c.WeeksLate || 0,
                paidAmount: c.PaidAmount || 0,
                retiredAmount: c.RetiredAmount || 0,
                balanceAmount: c.BalanceAmount || 0,
                totalAmount: c.TotalAmount || 0,
                startDate: c.StartDate || '',
                finishDate: c.FinishDate || '',
                prizeDate: c.PrizeDate || '',
                createdDate: c.CreatedDate || '',
                cancellationDate: c.CancellationDate || '',
                active: c.NameStatus?.toLowerCase() === 'activo',
            }));

            // TotalRegisters puede venir en el primer item o en la respuesta
            const total = dataArray[0]?.TotalRegisters || response.TotalRegisters || clubs.length;

            console.log(`✅ Clubes obtenidos: ${clubs.length} de ${total}`);

            return {
                data: clubs,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        } catch (error) {
            console.error('❌ Error al buscar clubes:', error);
            return { data: [], total: 0, page, pageSize, totalPages: 0 };
        }
    },

    // ==========================================
    // Obtener Club por ID
    // ==========================================
    async getClubById(clubId: string) {
        const { data } = await mdl05Client.get(`${BASE_URL}/getClub/${clubId}`);
        return data;
    },

    // ==========================================
    // Crear Club
    // ==========================================
    async createClub(clubData: CreateClubDTO): Promise<Club> {
        const payload = {
            saaSId: clubData.saaSId || 2,
            ClubTypeId: clubData.clubTypeId,
            CustomerId: clubData.customerId,
            SalesAgentId: clubData.salesAgentId,
            DenominationId: clubData.denominationId,
            StoreId: clubData.storeId,
            Share: clubData.share,
            StartDate: clubData.startDate,
        };

        console.log('🚀 Creando club:', payload);
        const { data } = await mdl05Client.post(`${BASE_URL}/createClub`, payload);
        console.log('✅ Club creado:', data);
        return data;
    },

    // ==========================================
    // Actualizar Club
    // ==========================================
    async updateClub(clubId: string, clubData: UpdateClubDTO): Promise<Club> {
        const { data } = await mdl05Client.patch(`${BASE_URL}/updateClub/${clubId}`, clubData);
        return data;
    },

    // ==========================================
    // Eliminar Club
    // ==========================================
    async deleteClub(clubId: string): Promise<void> {
        await mdl05Client.delete(`${BASE_URL}/deleteClub/${clubId}`);
    },

    // ==========================================
    // Semanas del Club
    // ==========================================
    async getClubWeeks(clubId: string): Promise<ClubWeek[]> {
        const { data } = await mdl05Client.get(`${BASE_URL}/getClubWeeks/${clubId}`);
        return data;
    },

    async payWeek(clubId: string, weekNumber: number, amount: number): Promise<ClubWeek> {
        const { data } = await mdl05Client.post(`${BASE_URL}/payClubWeek`, { clubId, weekNumber, amount });
        return data;
    },

    // ==========================================
    // Transacciones
    // ==========================================
    async getClubTransactions(clubId: string): Promise<ClubTransaction[]> {
        const { data } = await mdl05Client.get(`${BASE_URL}/getClubTransactions/${clubId}`);
        return data;
    },

    async createTransaction(clubId: string, transactionData: Partial<ClubTransaction>): Promise<ClubTransaction> {
        const { data } = await mdl05Client.post(`${BASE_URL}/createClubTransaction`, { clubId, ...transactionData });
        return data;
    },

    // ==========================================
    // Catálogos (mock por ahora)
    // ==========================================
    async getClubTypes(): Promise<ClubType[]> {
        return Promise.resolve(mockClubTypes);
    },

    async getClubStatuses(): Promise<ClubStatus[]> {
        try {
            const { data: response } = await mdl05Client.get(`${BASE_URL}/getClubStatus`);
            console.log('📦 Respuesta estados de club:', response);

            // La respuesta puede venir como array directo o dentro de una propiedad
            const dataArray = Array.isArray(response) ? response : (response?.Data || response?.data || []);

            // Mapear la respuesta del API al formato esperado
            const statuses: ClubStatus[] = dataArray.map((status: any) => ({
                clubStatusId: status.ClubStatusId || '',
                name: status.NameStatus || '',
                description: status.Description || '',
                color: status.Color || '',
            }));

            console.log('✅ Estados de club mapeados:', statuses);
            return statuses;
        } catch (error) {
            console.error('❌ Error al obtener estados de club:', error);
            // Fallback a mock data en caso de error
            return mockClubStatuses;
        }
    },

    async getDenominations(): Promise<Denomination[]> {
        return Promise.resolve(mockDenominations);
    },

    async getTransactionTypes(): Promise<any[]> {
        const { data } = await mdl05Client.get(`${BASE_URL}/getTransactionTypes`);
        return data;
    },

    // ==========================================
    // Reglas
    // ==========================================
    async getClubRules(): Promise<ClubRule[]> {
        const { data } = await mdl05Client.get(`${BASE_URL}/getClubRules`);
        return data;
    },

    async createRule(ruleData: Partial<ClubRule>): Promise<ClubRule> {
        const { data } = await mdl05Client.post(`${BASE_URL}/createClubRule`, ruleData);
        return data;
    },

    async updateRule(ruleId: string, ruleData: Partial<ClubRule>): Promise<ClubRule> {
        const { data } = await mdl05Client.patch(`${BASE_URL}/updateClubRule/${ruleId}`, ruleData);
        return data;
    },

    async deleteRule(ruleId: string): Promise<void> {
        await mdl05Client.delete(`${BASE_URL}/deleteClubRule/${ruleId}`);
    },

    // ==========================================
    // Sorteos
    // ==========================================
    async getDraws(): Promise<Draw[]> {
        try {
            const { data: response } = await mdl05Client.get(`${BASE_URL}/Draw/Get/DrawId/null`);
            console.log('📦 Respuesta sorteos:', response);

            // La respuesta puede venir como array directo o dentro de una propiedad
            const dataArray = Array.isArray(response) ? response : (response?.Data || response?.data || []);

            // Mapear la respuesta del API al formato esperado
            const draws: Draw[] = dataArray.map((draw: any) => ({
                drawId: draw.DrawId || draw.drawId || '',
                date: draw.Date || draw.date || '',
                numberPlayed: draw.NumberPlayed ?? draw.numberPlayed,
                alternativeDate: draw.AlternativeDate || draw.alternativeDate,
                clubTypeId: draw.ClubTypeId || draw.clubTypeId || '',
                comment: draw.Comment || draw.comment,
                createdDate: draw.CreatedDate || draw.createdDate || '',
                lastModifiedDate: draw.LastModifiedDate || draw.lastModifiedDate,
            }));

            console.log('✅ Sorteos mapeados:', draws);
            return draws;
        } catch (error) {
            console.error('❌ Error al obtener sorteos:', error);
            return [];
        }
    },

    async registerDraw(drawData: { date: string; numberPlayed: number; clubTypeId: string }): Promise<Draw> {
        const { data } = await mdl05Client.post(`${BASE_URL}/registerDraw`, drawData);
        return data;
    },

    async updateDraw(drawId: string, drawData: Partial<Draw>): Promise<Draw> {
        const { data } = await mdl05Client.patch(`${BASE_URL}/updateDraw/${drawId}`, drawData);
        return data;
    },

    // ==========================================
    // Límites
    // ==========================================
    async getLimitNumbers(): Promise<LimitNumber[]> {
        const { data } = await mdl05Client.get(`${BASE_URL}/getLimitNumbers`);
        return data;
    },

    async updateLimitNumber(number: number, limit: number): Promise<LimitNumber> {
        const { data } = await mdl05Client.patch(`${BASE_URL}/updateLimitNumber/${number}`, { limit });
        return data;
    },

    // ==========================================
    // Historial
    // ==========================================
    async getClubHistory(clubId: string): Promise<any[]> {
        const { data } = await mdl05Client.get(`${BASE_URL}/getClubHistory/${clubId}`);
        return data;
    },

    async getClubChangeHistory(clubId: string): Promise<any[]> {
        const { data } = await mdl05Client.get(`${BASE_URL}/getClubChangeHistory/${clubId}`);
        return data;
    },

    async searchByContract(contractNumber: string): Promise<Club[]> {
        const { data } = await mdl05Client.get(`${BASE_URL}/searchClub?contractNumber=${contractNumber}`);
        return data;
    },

    async getClubStats(clubId: string): Promise<any> {
        const { data } = await mdl05Client.get(`${BASE_URL}/getClubStats/${clubId}`);
        return data;
    },

    // ==========================================
    // Reportes
    // ==========================================
    async getReport1(lotteryDate: string): Promise<any> {
        try {
            console.log('📊 Generando reporte para fecha:', lotteryDate);

            const response = await mdl05Client.post(`${BASE_URL}/GetReport1`, {
                LotteryDate: lotteryDate
            }, {
                responseType: 'blob'
            });

            console.log('✅ Reporte generado - Headers:', response.headers);
            console.log('✅ Reporte generado - Data type:', typeof response.data);
            console.log('✅ Reporte generado - Data:', response.data);

            return response;
        } catch (error) {
            console.error('❌ Error al generar reporte:', error);
            throw error;
        }
    },

    // ==========================================
    // Formas de Pago
    // ==========================================
    async getPaymentMethods(clubId: string, filters?: PaymentMethodFilters): Promise<ClubPaymentMethod[]> {
        try {
            console.log('💳 Obteniendo formas de pago para club:', clubId);

            const params = new URLSearchParams();
            if (filters?.type) params.append('type', filters.type);
            if (filters?.active !== undefined) params.append('active', String(filters.active));
            if (filters?.isDefault !== undefined) params.append('isDefault', String(filters.isDefault));

            const queryString = params.toString();
            const url = `${BASE_URL}/club/${clubId}/paymentMethods${queryString ? `?${queryString}` : ''}`;

            const { data } = await mdl05Client.get(url);

            console.log('✅ Formas de pago obtenidas:', data);
            return data;
        } catch (error) {
            console.error('❌ Error al obtener formas de pago:', error);
            throw error;
        }
    },

    async getPaymentMethod(paymentMethodId: string): Promise<ClubPaymentMethod> {
        try {
            console.log('💳 Obteniendo forma de pago:', paymentMethodId);

            const { data } = await mdl05Client.get(`${BASE_URL}/paymentMethods/${paymentMethodId}`);

            console.log('✅ Forma de pago obtenida:', data);
            return data;
        } catch (error) {
            console.error('❌ Error al obtener forma de pago:', error);
            throw error;
        }
    },

    async createPaymentMethod(paymentMethodData: CreatePaymentMethodDTO): Promise<ClubPaymentMethod> {
        try {
            console.log('💳 Creando forma de pago:', paymentMethodData);

            const { data } = await mdl05Client.post(`${BASE_URL}/club/${paymentMethodData.clubId}/paymentMethods`, paymentMethodData);

            console.log('✅ Forma de pago creada:', data);
            return data;
        } catch (error) {
            console.error('❌ Error al crear forma de pago:', error);
            throw error;
        }
    },

    async updatePaymentMethod(paymentMethodId: string, paymentMethodData: UpdatePaymentMethodDTO): Promise<ClubPaymentMethod> {
        try {
            console.log('💳 Actualizando forma de pago:', paymentMethodId, paymentMethodData);

            const { data } = await mdl05Client.patch(`${BASE_URL}/paymentMethods/${paymentMethodId}`, paymentMethodData);

            console.log('✅ Forma de pago actualizada:', data);
            return data;
        } catch (error) {
            console.error('❌ Error al actualizar forma de pago:', error);
            throw error;
        }
    },

    async deletePaymentMethod(paymentMethodId: string): Promise<void> {
        try {
            console.log('💳 Eliminando forma de pago:', paymentMethodId);

            await mdl05Client.delete(`${BASE_URL}/paymentMethods/${paymentMethodId}`);

            console.log('✅ Forma de pago eliminada');
        } catch (error) {
            console.error('❌ Error al eliminar forma de pago:', error);
            throw error;
        }
    },

    async setDefaultPaymentMethod(clubId: string, paymentMethodId: string): Promise<ClubPaymentMethod> {
        try {
            console.log('💳 Estableciendo forma de pago por defecto:', { clubId, paymentMethodId });

            const { data } = await mdl05Client.patch(`${BASE_URL}/club/${clubId}/paymentMethods/${paymentMethodId}/setDefault`);

            console.log('✅ Forma de pago establecida como predeterminada');
            return data;
        } catch (error) {
            console.error('❌ Error al establecer forma de pago predeterminada:', error);
            throw error;
        }
    },
};