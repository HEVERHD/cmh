// src/app/(dashboard)/clientes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ClienteRegistroForm from '@/components/clientes/ClienteRegistroForm';
import {
    registerCustomer,
    searchCustomers,
    ClienteFormData,
    CustomerListItem
} from '@/services/customerService';

export default function ClientesPage() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [clientes, setClientes] = useState<CustomerListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(10);

    // Búsqueda
    const [searchText, setSearchText] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Función para cargar clientes
    const loadCustomers = useCallback(async (page: number = 1, search: string = '') => {
        setIsLoadingList(true);
        try {
            const response = await searchCustomers({
                pageNumber: page,
                pageSize: pageSize,
                searchText: search
            });

            if (response.Data && response.Data.length > 0) {
                setClientes(response.Data);
                // TotalRegisters viene en Data[0]
                const count = (response.Data[0] as any)?.TotalRegisters || response.Data.length;
                setTotalCount(count);
                // Calcular totalPages desde TotalRegisters
                const calculatedPages = Math.ceil(count / pageSize) || 1;
                setTotalPages(calculatedPages);
                setCurrentPage(page);
            } else {
                setClientes([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (err: any) {
            console.error('Error al cargar clientes:', err);
            setError(err.message || 'Error al cargar la lista de clientes');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoadingList(false);
        }
    }, [pageSize]);

    // Cargar clientes al montar el componente
    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    // Manejar búsqueda
    const handleSearch = () => {
        setSearchText(searchInput);
        setCurrentPage(1);
        loadCustomers(1, searchInput);
    };

    // Manejar cambio de página
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        loadCustomers(newPage, searchText);
    };

    const handleSubmitCliente = async (data: ClienteFormData) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await registerCustomer(data);
            console.log('Cliente registrado exitosamente:', response);

            setMostrarFormulario(false);
            setSuccessMessage('Cliente registrado exitosamente');

            // Recargar la lista de clientes desde el inicio
            await loadCustomers(1, searchText);

            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            console.error('Error al registrar cliente:', err);
            setError(err.message || 'Error al registrar el cliente. Por favor intente nuevamente.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    // Obtener nombre del cliente
    const getCustomerName = (cliente: CustomerListItem): string => {
        if (cliente.LegalName || cliente.ComercialName) {
            return cliente.ComercialName || cliente.LegalName || '-';
        }
        const parts = [cliente.FirstName, cliente.FullName, cliente.LastName].filter(Boolean);
        return parts.join(' ') || '-';
    };

    // Obtener documento del cliente
    const getCustomerDocument = (cliente: CustomerListItem): string => {
        const doc = cliente.NumberId || cliente.Ruc || '-';
        if (doc !== '-' && cliente.Dv) {
            return `${doc}-${cliente.Dv}`;
        }
        return doc;
    };

    // Determinar si es empresa o particular
    const isEmpresa = (cliente: CustomerListItem): boolean => {
        return !!(cliente.LegalName || cliente.ComercialName);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Gestión de Clientes</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Miembros del club, historial y preferencias</p>
                </div>
                {!mostrarFormulario && (
                    <button
                        onClick={() => setMostrarFormulario(true)}
                        className="px-4 py-2 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-glow)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                    >
                        + Nuevo Cliente
                    </button>
                )}
            </div>

            {/* Mensajes de éxito/error */}
            {successMessage && (
                <div className="px-4 py-3 rounded-lg flex items-center" style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="px-4 py-3 rounded-lg flex items-center" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)', color: 'var(--error)' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto transition-colors"
                        style={{ color: 'var(--error)' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {mostrarFormulario ? (
                <div className="rounded-xl p-8 shadow-sm relative" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    {isLoading && (
                        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl" style={{ backgroundColor: 'rgba(26, 29, 36, 0.95)' }}>
                            <div className="flex flex-col items-center p-8 rounded-2xl shadow-xl" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border-accent)' }}>
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 rounded-full" style={{ borderColor: 'var(--border)' }}></div>
                                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ borderColor: 'var(--primary)' }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Registrando cliente</p>
                                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Por favor espere un momento...</p>
                                <div className="mt-4 flex space-x-1">
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <ClienteRegistroForm
                        onSubmit={handleSubmitCliente}
                        onCancel={() => {
                            setMostrarFormulario(false);
                            setError(null);
                        }}
                    />
                </div>
            ) : (
                <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    {/* Barra de búsqueda */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Buscar por nombre, documento, código..."
                                className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none transition-all"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                                onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                            />
                            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 text-white rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--primary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-glow)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                        >
                            Buscar
                        </button>
                        <button
                            onClick={() => loadCustomers(currentPage, searchText)}
                            className="px-4 py-2 rounded-lg transition-colors"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Actualizar lista"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {isLoadingList ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="flex flex-col items-center p-8 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border-accent)' }}>
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 rounded-full" style={{ borderColor: 'var(--border)' }}></div>
                                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ borderColor: 'var(--primary)' }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-5 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Cargando clientes</p>
                                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Por favor espere un momento...</p>
                                <div className="mt-4 flex space-x-1.5">
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    ) : clientes.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Clientes Registrados
                                    <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
                                        ({totalCount} total)
                                    </span>
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full" style={{ borderColor: 'var(--border)' }}>
                                    <thead style={{ backgroundColor: 'var(--card-hover)' }}>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Código
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Documento
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Teléfono
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Lista de Precios
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderColor: 'var(--border)' }}>
                                        {clientes.map((cliente) => (
                                            <tr key={cliente.CustomerId} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--primary)' }}>
                                                    {cliente.SystemCode || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full`} style={isEmpresa(cliente) ? { backgroundColor: 'var(--success-bg)', color: 'var(--success)' } : { backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
                                                        {isEmpresa(cliente) ? 'Empresa' : 'Particular'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                                                    {getCustomerName(cliente)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {getCustomerDocument(cliente)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {cliente.Email || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {cliente.PhoneNumber || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {cliente.PriceList?.[0]?.PriceListName || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className="flex justify-between items-center pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Mostrando {clientes.length} de {totalCount} clientes - Página {currentPage} de {totalPages}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                            className="px-2 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            title="Primera página"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            Anterior
                                        </button>

                                        {/* Números de página */}
                                        <div className="flex gap-1 mx-2">
                                            {(() => {
                                                const pages = [];
                                                let startPage = Math.max(1, currentPage - 2);
                                                let endPage = Math.min(totalPages, currentPage + 2);

                                                // Ajustar para mostrar siempre 5 páginas si es posible
                                                if (endPage - startPage < 4) {
                                                    if (startPage === 1) {
                                                        endPage = Math.min(totalPages, startPage + 4);
                                                    } else if (endPage === totalPages) {
                                                        startPage = Math.max(1, endPage - 4);
                                                    }
                                                }

                                                for (let i = startPage; i <= endPage; i++) {
                                                    const isActive = currentPage === i;
                                                    pages.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => handlePageChange(i)}
                                                            className={`min-w-[36px] px-3 py-1 border rounded-lg text-sm font-medium transition-colors`}
                                                            style={isActive ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' } : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                                            onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                                            onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                                        >
                                                            {i}
                                                        </button>
                                                    );
                                                }
                                                return pages;
                                            })()}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            Siguiente
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="px-2 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            title="Última página"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--card-hover)' }}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                {searchText ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                            </h3>
                            <p className="max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                {searchText
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Comienza registrando tu primer cliente haciendo clic en el botón "Nuevo Cliente".'
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
