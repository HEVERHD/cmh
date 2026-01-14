// ============================================
// TIPOS BASE - lib/types/club.ts
// ============================================

export interface Club {
    clubId: string;
    contractNumber: string;
    customerId: string;
    customerName?: string; // Nombre del cliente expandido
    customerNumber?: string; // Número del cliente
    externalCode?: string;
    clubTypeId: string;
    denominationId: string;
    clubStatusId: string;
    statusName?: string; // Nombre del estado expandido
    salesAgentId: string;
    storeId: string;
    saaSId: number;
    share: number;
    weeksPlayed: number;
    weeksPaid: number;
    weeksLate: number;
    paidAmount: number;
    retiredAmount: number;
    balanceAmount: number;
    totalAmount: number;
    startDate: string;
    finishDate: string;
    prizeDate?: string;
    cancellationDate?: string;
    active: boolean;
    status?: number;
    createdDate: string;
    createdBy?: string;
    lastModifiedDate?: string;
    lastModifiedBy?: string;
}

export interface ClubType {
    clubTypeId: string;
    name: string; // Miércoles, Domingo, Combinado
    description?: string;
    active: boolean;
}

export interface ClubStatus {
    clubStatusId: string;
    name: string; // Activo, Anulado, Cerrado, En Auditoría
    description?: string;
    color?: string;
}

export interface Denomination {
    denominationId: string;
    value: number; // 3, 4, 10 dólares
    description?: string;
    active: boolean;
}

export interface ClubWeek {
    clubWeekId: string;
    clubId: string;
    weekNumber: number;
    dueDate: string;
    paidDate?: string;
    amount: number;
    status: 'pending' | 'paid' | 'late' | 'cancelled';
    transactionId?: string;
    createdDate: string;
}

export interface ClubTransaction {
    transactionId: string;
    clubId: string;
    transactionTypeId: string;
    amount: number;
    description?: string;
    referenceNumber?: string;
    createdDate: string;
    createdBy: string;
}

export interface TransactionType {
    transactionTypeId: string;
    name: string; // Pago, Retiro, Comisión, Premiación
    code: string;
    isCredit: boolean;
    active: boolean;
}

export interface ClubRule {
    ruleId: string;
    startWeek: number;
    endWeek: number;
    penaltyPercentage: number;
    description?: string;
    active: boolean;
}

export interface LimitNumber {
    limitNumberId: string;
    number: number;
    limit: number; // 1-39: 100, 40-99: 300
    active: boolean;
}

export interface Draw {
    drawId: string;
    date: string;
    numberPlayed?: number;
    alternativeDate?: string;
    clubTypeId: string;
    createdDate: string;
    lastModifiedDate?: string;
}

export interface ClubConfiguration {
    configurationId: string;
    key: string;
    value: string;
    description?: string;
    active: boolean;
}

export interface ClubChangeHistory {
    historyId: string;
    clubId: string;
    fieldChanged: string;
    oldValue: string;
    newValue: string;
    changedBy: string;
    changedDate: string;
    reason?: string;
}

// ==========================================
// DTOs para crear/actualizar
// ==========================================

// DTO que coincide con el CURL proporcionado
export interface CreateClubDTO {
    saaSId?: number;
    clubTypeId: string;      // ClubTypeId en el API
    customerId: string;      // CustomerId en el API
    salesAgentId: string;    // SalesAgentId en el API
    denominationId: string;  // DenominationId en el API
    storeId: string;         // StoreId en el API
    share: number;           // Share en el API
    startDate: string;       // StartDate en el API (formato: "2025-06-01 12:57:17.250")
}

export interface UpdateClubDTO {
    clubStatusId?: string;
    share?: number;
    active?: boolean;
}

// ==========================================
// Filtros para búsqueda
// ==========================================
export interface ClubFilters {
    search?: string;
    clubTypeId?: string;
    clubStatusId?: string;
    statusName?: string;
    denominationId?: string;
    storeId?: string;
    salesAgentId?: string;
    active?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    finishDateFrom?: string;
    finishDateTo?: string;
}

// ==========================================
// Respuesta paginada
// ==========================================
export interface PaginatedClubs {
    data: Club[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ==========================================
// Club con relaciones expandidas
// ==========================================
export interface ClubWithDetails extends Club {
    clubType?: ClubType;
    clubStatus?: ClubStatus;
    denomination?: Denomination;
    customer?: {
        customerId: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    salesAgent?: {
        salesAgentId: string;
        name: string;
    };
    store?: {
        storeId: string;
        name: string;
    };
    weeks?: ClubWeek[];
    transactions?: ClubTransaction[];
}