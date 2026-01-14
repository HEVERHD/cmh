// src/components/shared/ClienteSearchSelect.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, X } from 'lucide-react';
import { useClientesSearch } from '@/lib/hooks/useClientes';

interface ClienteOption {
    value: string;
    label: string;
    email?: string;
    phone?: string;
}

interface Props {
    onChange: (value: string, cliente?: ClienteOption) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export function ClienteSearchSelect({
    onChange,
    placeholder = 'Buscar cliente por nombre, email o teléfono...',
    disabled,
    error,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState<ClienteOption | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: clientes, isLoading } = useClientesSearch(searchTerm);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (cliente: ClienteOption) => {
        setSelectedCliente(cliente);
        setSearchTerm('');
        setIsOpen(false);
        onChange(cliente.value, cliente);
    };

    const handleClear = () => {
        setSelectedCliente(null);
        setSearchTerm('');
        onChange('');
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Input de búsqueda o cliente seleccionado */}
            {selectedCliente ? (
                <div
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        border: error ? '1px solid var(--error)' : '1px solid var(--border)',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {selectedCliente.label}
                            </p>
                            {selectedCliente.email && (
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {selectedCliente.email}
                                </p>
                            )}
                        </div>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 rounded transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                        style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={(e) => {
                            setIsOpen(true);
                            if (!error) e.currentTarget.style.border = '2px solid var(--primary)';
                        }}
                        onBlur={(e) => {
                            if (!error) e.currentTarget.style.border = '1px solid var(--border)';
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="w-full px-4 py-2.5 pl-9 rounded-lg focus:outline-none transition-all"
                        style={{
                            backgroundColor: 'var(--input-bg)',
                            border: error ? '1px solid var(--error)' : '1px solid var(--border)',
                            color: 'var(--text-primary)',
                        }}
                    />
                    {isLoading && (
                        <Loader2
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin"
                            style={{ color: 'var(--text-muted)' }}
                        />
                    )}
                </div>
            )}

            {/* Dropdown de resultados */}
            {isOpen && searchTerm.length >= 2 && (
                <div
                    className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto"
                    style={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                    }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                            <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Buscando...</span>
                        </div>
                    ) : clientes && clientes.length > 0 ? (
                        <ul>
                            {clientes.map((cliente) => (
                                <li
                                    key={cliente.value}
                                    onClick={() => handleSelect(cliente)}
                                    className="px-3 py-2 cursor-pointer transition-colors"
                                    style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {cliente.label}
                                    </p>
                                    <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {cliente.email && <span>{cliente.email}</span>}
                                        {cliente.phone && <span>{cliente.phone}</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                            No se encontraron clientes
                        </div>
                    )}
                </div>
            )}

            {/* Mensaje de ayuda */}
            {!selectedCliente && !isOpen && searchTerm.length === 0 && (
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Escribe al menos 2 caracteres para buscar
                </p>
            )}
        </div>
    );
}