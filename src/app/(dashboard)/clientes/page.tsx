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
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
                    <p className="text-gray-500 mt-1">Miembros del club, historial y preferencias</p>
                </div>
                {!mostrarFormulario && (
                    <button
                        onClick={() => setMostrarFormulario(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        + Nuevo Cliente
                    </button>
                )}
            </div>

            {/* Mensajes de éxito/error */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {mostrarFormulario ? (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 to-white/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                            <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-4 text-lg font-semibold text-gray-800">Registrando cliente</p>
                                <p className="mt-1 text-sm text-gray-500">Por favor espere un momento...</p>
                                <div className="mt-4 flex space-x-1">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
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
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                    {/* Barra de búsqueda */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Buscar por nombre, documento, código..."
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Buscar
                        </button>
                        <button
                            onClick={() => loadCustomers(currentPage, searchText)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Actualizar lista"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {isLoadingList ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-sm border border-blue-100">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-5 text-lg font-semibold text-gray-800">Cargando clientes</p>
                                <p className="mt-1 text-sm text-gray-500">Por favor espere un momento...</p>
                                <div className="mt-4 flex space-x-1.5">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    ) : clientes.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Clientes Registrados
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        ({totalCount} total)
                                    </span>
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Código
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Documento
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Teléfono
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Lista de Precios
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {clientes.map((cliente) => (
                                            <tr key={cliente.CustomerId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                    {cliente.SystemCode || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        isEmpresa(cliente)
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {isEmpresa(cliente) ? 'Empresa' : 'Particular'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {getCustomerName(cliente)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {getCustomerDocument(cliente)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {cliente.Email || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {cliente.PhoneNumber || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {cliente.PriceList?.[0]?.PriceListName || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className="flex justify-between items-center pt-4 border-t mt-4">
                                    <div className="text-sm text-gray-500">
                                        Mostrando {clientes.length} de {totalCount} clientes - Página {currentPage} de {totalPages}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            title="Primera página"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                                                    pages.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => handlePageChange(i)}
                                                            className={`min-w-[36px] px-3 py-1 border rounded-lg text-sm font-medium transition-colors ${
                                                                currentPage === i
                                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                                            }`}
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
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Siguiente
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchText ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                            </h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
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
