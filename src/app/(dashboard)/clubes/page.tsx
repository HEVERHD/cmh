'use client';

import { useState } from 'react';
import {
    Plus, Filter, Download, Search, MoreHorizontal,
    Eye, Edit, Trash2, Calendar, RefreshCw, Loader2,
} from 'lucide-react';
import { useClubs, useClubTypes, useClubStatuses, useDenominations } from '@/lib/hooks/useClubs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ClubCreateModal } from '@/components/clubes/ClubCreateModal';
import { ClubDetailSheet } from '@/components/clubes/ClubDetailSheet';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { ClubFilters } from '@/types/club';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const statusColors: Record<string, { bg: string; text: string }> = {
    activo: { bg: 'var(--success-bg)', text: 'var(--success)' },
    anulado: { bg: 'var(--error-bg)', text: 'var(--error)' },
    cerrado: { bg: 'var(--muted-bg)', text: 'var(--text-muted)' },
    'en auditoría': { bg: 'var(--warning-bg)', text: 'var(--warning)' },
};

export default function ClubesPage() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [filters, setFilters] = useState<ClubFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedClub, setSelectedClub] = useState<any>(null); // Cambiado a club completo

    const { data: clubsData, isLoading, isFetching, refetch } = useClubs(filters, page, pageSize);
    const { data: clubTypes } = useClubTypes();
    const { data: clubStatuses } = useClubStatuses();
    const { data: denominations } = useDenominations();

    const handleFilterChange = (key: keyof ClubFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value || undefined }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({});
        setPage(1);
    };

    const activeFiltersCount = Object.keys(filters).filter(
        (k) => k !== 'search' && filters[k as keyof ClubFilters]
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Gestión de Clubes</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Administra clubes, semanas y transacciones</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
                        {isFetching ? 'Cargando...' : 'Actualizar'}
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Club
                    </Button>
                </div>
            </div>

            {/* Loading Alert - Primera carga */}
            {isLoading && (
                <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                        Cargando clubes... Este proceso puede tardar hasta 1 minuto.
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="pb-2">
                        <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Clubes</h3>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {isLoading ? <Skeleton className="h-8 w-16" /> : clubsData?.total || 0}
                    </div>
                </div>
                <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="pb-2">
                        <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Activos</h3>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                        {isLoading ? <Skeleton className="h-8 w-16" /> : clubsData?.data?.filter((c) => c.active).length || 0}
                    </div>
                </div>
                <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="pb-2">
                        <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Monto Pagado</h3>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(clubsData?.data?.reduce((sum, c) => sum + c.paidAmount, 0) || 0)}
                    </div>
                </div>
                <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="pb-2">
                        <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Balance Pendiente</h3>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>
                        {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(clubsData?.data?.reduce((sum, c) => sum + c.balanceAmount, 0) || 0)}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por contrato o cliente..."
                                className="pl-9"
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
                            )}
                        </Button>
                        {Object.keys(filters).length > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                Limpiar filtros
                            </Button>
                        )}
                        {isFetching && !isLoading && (
                            <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Actualizando...
                            </div>
                        )}
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                            <Select value={filters.clubTypeId || ''} onValueChange={(v) => handleFilterChange('clubTypeId', v)}>
                                <SelectTrigger><SelectValue placeholder="Tipo de club" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos los tipos</SelectItem>
                                    {clubTypes?.map((type) => (
                                        <SelectItem key={type.clubTypeId} value={type.clubTypeId}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.clubStatusId || ''} onValueChange={(v) => handleFilterChange('clubStatusId', v)}>
                                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos los estados</SelectItem>
                                    {clubStatuses?.map((status) => (
                                        <SelectItem key={status.clubStatusId} value={status.clubStatusId}>{status.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.denominationId || ''} onValueChange={(v) => handleFilterChange('denominationId', v)}>
                                <SelectTrigger><SelectValue placeholder="Denominación" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todas</SelectItem>
                                    {denominations?.map((d) => (
                                        <SelectItem key={d.denominationId} value={d.denominationId}>${d.value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.active?.toString() || ''} onValueChange={(v) => handleFilterChange('active' as keyof ClubFilters, v)}>
                                <SelectTrigger><SelectValue placeholder="Estado activo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Todos</SelectItem>
                                    <SelectItem value="true">Activos</SelectItem>
                                    <SelectItem value="false">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--muted-bg)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Contrato</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Cliente</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Cédula</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Share</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Estado</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Balance</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Fecha Creación</th>
                                <th className="w-[50px] px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}></th>
                            </tr>
                        </thead>
                        <tbody style={{ borderColor: 'var(--border)' }}>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : clubsData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                                        No se encontraron clubes
                                    </td>
                                </tr>
                            ) : (
                                clubsData?.data?.map((club) => (
                                    <tr
                                        key={club.clubId}
                                        className="cursor-pointer transition-colors"
                                        style={{ borderTop: '1px solid var(--border)' }}
                                        onClick={() => setSelectedClub(club)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{club.contractNumber}</td>
                                        <td className="px-6 py-4 max-w-[200px] truncate" style={{ color: 'var(--text-primary)' }} title={club.customerName}>
                                            {club.customerName}
                                        </td>
                                        <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>{club.customerNumber}</td>
                                        <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{club.share}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{
                                                backgroundColor: statusColors[club.statusName?.toLowerCase() || '']?.bg || 'var(--muted-bg)',
                                                color: statusColors[club.statusName?.toLowerCase() || '']?.text || 'var(--text-muted)'
                                            }}>
                                                {club.statusName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {formatCurrency(club.balanceAmount)}
                                        </td>
                                        <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{formatDate(club.createdDate)}</td>
                                        <td className="px-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedClub(club); }}>
                                                        <Eye className="h-4 w-4 mr-2" />Ver detalles
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                                    <DropdownMenuItem><Calendar className="h-4 w-4 mr-2" />Ver semanas</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="h-4 w-4 mr-2" />Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {clubsData && clubsData.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, clubsData.total)} de {clubsData.total}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page === 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
                                Anterior
                            </Button>
                            <Button variant="outline" size="sm" disabled={page >= clubsData.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <ClubCreateModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
            <ClubDetailSheet club={selectedClub} onClose={() => setSelectedClub(null)} />
        </div>
    );
}