// src/components/shared/ClienteSearchSelect.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useClientesSearch } from '@/lib/hooks/useClientes';
import { cn } from '@/lib/utils';

interface ClienteOption {
    value: string;
    label: string;
    email?: string;
    phone?: string;
}

interface Props {
    value?: string;
    onChange: (value: string, cliente?: ClienteOption) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export function ClienteSearchSelect({
    value,
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
                <div className={cn(
                    "flex items-center justify-between px-3 py-2 border rounded-md bg-gray-50",
                    error && "border-red-500"
                )}>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium">{selectedCliente.label}</p>
                            {selectedCliente.email && (
                                <p className="text-xs text-gray-500">{selectedCliente.email}</p>
                            )}
                        </div>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-200 rounded"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn("pl-9", error && "border-red-500")}
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                    )}
                </div>
            )}

            {/* Dropdown de resultados */}
            {isOpen && searchTerm.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Buscando...</span>
                        </div>
                    ) : clientes && clientes.length > 0 ? (
                        <ul>
                            {clientes.map((cliente) => (
                                <li
                                    key={cliente.value}
                                    onClick={() => handleSelect(cliente)}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                                >
                                    <p className="text-sm font-medium">{cliente.label}</p>
                                    <div className="flex gap-3 text-xs text-gray-500">
                                        {cliente.email && <span>{cliente.email}</span>}
                                        {cliente.phone && <span>{cliente.phone}</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="py-4 text-center text-sm text-gray-500">
                            No se encontraron clientes
                        </div>
                    )}
                </div>
            )}

            {/* Mensaje de ayuda */}
            {!selectedCliente && !isOpen && searchTerm.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">
                    Escribe al menos 2 caracteres para buscar
                </p>
            )}

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}