// src/types/clientes.ts

export interface Cliente {
    id: string;
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    birthDate?: string;
    gender?: 'M' | 'F' | 'O';
    status: 'active' | 'inactive' | 'suspended';
    tipoCliente?: string;
    puntosDisponibles: number;
    puntosAcumulados: number;
    totalCompras: number;
    ultimaCompra?: string;
    fechaRegistro: string;
    notas?: string;
    tags?: string[];
    active: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ClienteFilters {
    search?: string;
    status?: Cliente['status'];
    tipoCliente?: string;
    city?: string;
    state?: string;
    dateFrom?: string;
    dateTo?: string;
    puntosMin?: number;
    puntosMax?: number;
}

export interface CreateClienteDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    birthDate?: string;
    gender?: 'M' | 'F' | 'O';
    tipoCliente?: string;
    notas?: string;
    tags?: string[];
}

export interface UpdateClienteDTO extends Partial<CreateClienteDTO> {
    status?: Cliente['status'];
    active?: boolean;
}

export interface AjustePuntosDTO {
    clienteId: string;
    tipo: 'agregar' | 'restar' | 'establecer';
    cantidad: number;
    motivo: string;
    referencia?: string;
}

export interface MovimientoPuntos {
    id: string;
    clienteId: string;
    tipo: 'compra' | 'canje' | 'ajuste' | 'expiracion' | 'promocion';
    cantidad: number;
    saldoAnterior: number;
    saldoNuevo: number;
    descripcion: string;
    referencia?: string;
    fecha: string;
    usuario?: string;
}

export interface HistorialCompra {
    id: string;
    clienteId: string;
    fecha: string;
    total: number;
    puntosGanados: number;
    puntosUsados: number;
    items: number;
    tienda?: string;
    referencia: string;
}

export interface ClienteStats {
    total: number;
    activos: number;
    inactivos: number;
    nuevosEsteMes: number;
    totalPuntos: number;
    promedioCompras: number;
}

export interface PaginatedClientes {
    data: Cliente[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}