// src/app/(dashboard)/clientes/page.tsx
'use client';

import { useState } from 'react';
import ClienteRegistroForm from '@/components/clientes/ClienteRegistroForm';
import { registerCustomer, ClienteFormData } from '@/services/customerService';

export default function ClientesPage() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [clientes, setClientes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmitCliente = async (data: ClienteFormData) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await registerCustomer(data);

            console.log('Cliente registrado exitosamente:', response);

            // Agregar cliente a la lista local
            setClientes([...clientes, {
                ...data,
                id: response.Data?.CustomerId || Date.now(),
                customerCode: response.Data?.CustomerCode
            }]);

            setMostrarFormulario(false);
            setSuccessMessage('Cliente registrado exitosamente');

            // Limpiar mensaje después de 5 segundos
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            console.error('Error al registrar cliente:', err);
            setError(err.message || 'Error al registrar el cliente. Por favor intente nuevamente.');

            // Limpiar mensaje de error después de 5 segundos
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
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
                    {clientes.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Clientes Registrados</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
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
                                                País
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {clientes.map((cliente) => (
                                            <tr key={cliente.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        cliente.tipoCliente === 'particular'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {cliente.tipoCliente === 'particular' ? 'Particular' : 'Empresa'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {cliente.tipoCliente === 'particular'
                                                        ? `${cliente.nombre} ${cliente.apellido}`
                                                        : cliente.nombreComercial
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {cliente.tipoCliente === 'particular'
                                                        ? `${cliente.cedula}${cliente.dv ? `-${cliente.dv}` : ''}`
                                                        : `${cliente.ruc}-${cliente.dv}`
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {cliente.pais || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes registrados</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Comienza registrando tu primer cliente haciendo clic en el botón "Nuevo Cliente".
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
