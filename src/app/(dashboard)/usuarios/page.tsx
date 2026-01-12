// src/app/(dashboard)/usuarios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { searchUsers, type User } from '@/services/userService';

const statusLabels = {
    active: { label: 'Activo', bgColor: 'var(--success-bg)', textColor: 'var(--success)' },
    inactive: { label: 'Inactivo', bgColor: 'var(--muted-bg)', textColor: 'var(--text-muted)' },
};

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Cargar usuarios desde el API
    const loadUsers = async (searchText: string = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await searchUsers({
                SearchText: searchText || null,
                PageNumber: page,
                PageSize: pageSize,
                Email: null,
                IDNumber: null,
                UserName: null
            });

            if (response.Data) {
                setUsuarios(response.Data);
                setTotalCount(response.TotalCount || 0);
            } else {
                setUsuarios([]);
                setTotalCount(0);
            }
        } catch (err: any) {
            console.error('Error cargando usuarios:', err);
            setError(err.message || 'Error al cargar usuarios');
            setUsuarios([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar usuarios cuando cambia la búsqueda o la página
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            loadUsers(search);
        }, search ? 500 : 0); // Sin delay en carga inicial

        return () => clearTimeout(delayDebounce);
    }, [search, page]); // Dependencias: search y page

    // Reset a página 1 cuando cambia la búsqueda
    useEffect(() => {
        if (search !== undefined) {
            setPage(1);
        }
    }, [search]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Gestión de Usuarios</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Administra el acceso al sistema</p>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex-1 relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none transition-all"
                        style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                        onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                    />
                </div>
                <button
                    onClick={() => loadUsers(search)}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Cargando...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Actualizar
                        </>
                    )}
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)' }}>
                    <p style={{ color: 'var(--error)' }}>{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--muted-bg)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Nombre</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Correo</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Documento</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Teléfono</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody style={{ borderColor: 'var(--border)' }}>
                            {isLoading ? (
                                // Loading skeleton
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: 'var(--muted-bg)' }}></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--muted-bg)' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--muted-bg)' }}></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--muted-bg)' }}></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--muted-bg)' }}></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 w-16 rounded-full animate-pulse" style={{ backgroundColor: 'var(--muted-bg)' }}></div>
                                        </td>
                                    </tr>
                                ))
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                                        {error ? 'Error al cargar usuarios' : 'No se encontraron usuarios'}
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map((user) => (
                                    <tr key={user.UserId} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: 'var(--primary)' }}>
                                                    {user.FirstName?.charAt(0) || user.Email?.charAt(0) || 'U'}
                                                </div>
                                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {user.FirstName && user.LastName ? `${user.FirstName} ${user.LastName}` : user.FullName || user.UserName || 'Sin nombre'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {user.Email || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {user.IDNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {user.PhoneNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{
                                                backgroundColor: user.Active !== false ? statusLabels.active.bgColor : statusLabels.inactive.bgColor,
                                                color: user.Active !== false ? statusLabels.active.textColor : statusLabels.inactive.textColor
                                            }}>
                                                {user.Active !== false ? statusLabels.active.label : statusLabels.inactive.label}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, totalCount)} de {totalCount}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--card)' }}
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages}
                                className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--card)' }}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}