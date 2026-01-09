'use client';

import { useState, useEffect, useRef } from 'react';
import { getMaritalStatuses, MaritalStatus } from '@/services/maritalStatusService';

interface MaritalStatusSelectorProps {
    value: string;
    onChange: (description: string) => void;
    error?: string;
    required?: boolean;
}

export default function MaritalStatusSelector({ value, onChange, error, required }: MaritalStatusSelectorProps) {
    const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
    const [filteredStatuses, setFilteredStatuses] = useState<MaritalStatus[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<MaritalStatus | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchMaritalStatuses = async () => {
            setIsLoading(true);
            try {
                const data = await getMaritalStatuses();
                setMaritalStatuses(data);
                setFilteredStatuses(data);
            } catch (error) {
                console.error('Error loading marital statuses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMaritalStatuses();
    }, []);

    useEffect(() => {
        // Cerrar dropdown al hacer clic fuera
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Si hay un valor inicial, buscar el estado civil correspondiente
        if (value && maritalStatuses.length > 0 && !selectedStatus) {
            const status = maritalStatuses.find(s => s.Description === value);
            if (status) {
                setSelectedStatus(status);
                setSearchTerm(status.Description);
            }
        }
    }, [value, maritalStatuses]);

    useEffect(() => {
        // Filtrar estados civiles según el término de búsqueda
        if (searchTerm.trim() === '') {
            setFilteredStatuses(maritalStatuses);
        } else {
            const normalizeText = (text: string) => {
                return text
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            };

            const normalizedSearch = normalizeText(searchTerm);
            const filtered = maritalStatuses.filter(status =>
                normalizeText(status.Description).includes(normalizedSearch)
            );
            setFilteredStatuses(filtered);
        }
    }, [searchTerm, maritalStatuses]);

    const handleSelect = (status: MaritalStatus) => {
        setSelectedStatus(status);
        setSearchTerm(status.Description);
        onChange(status.Description);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);

        // Si el usuario borra todo, limpiar la selección
        if (newValue === '') {
            setSelectedStatus(null);
            onChange('');
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={isLoading ? 'Cargando estados civiles...' : 'Buscar estado civil...'}
                    disabled={isLoading}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                    style={{
                        backgroundColor: isLoading ? 'var(--muted-bg)' : 'var(--input-bg)',
                        border: error ? '1px solid var(--error)' : '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        cursor: isLoading ? 'not-allowed' : 'text'
                    }}
                    onFocusCapture={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                    onBlur={(e) => e.currentTarget.style.border = error ? '1px solid var(--error)' : '1px solid var(--border)'}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                        style={{ color: 'var(--text-muted)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && !isLoading && (
                <div className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    {filteredStatuses.length > 0 ? (
                        <ul className="py-1">
                            {filteredStatuses.map((status) => (
                                <li key={status.MaritalStatusId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(status)}
                                        className="w-full text-left px-4 py-2 transition-colors"
                                        style={{
                                            backgroundColor: selectedStatus?.MaritalStatusId === status.MaritalStatusId ? 'var(--primary-light)' : 'transparent',
                                            color: selectedStatus?.MaritalStatusId === status.MaritalStatusId ? 'var(--primary)' : 'var(--text-primary)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedStatus?.MaritalStatusId !== status.MaritalStatusId) {
                                                e.currentTarget.style.backgroundColor = 'var(--card-hover)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedStatus?.MaritalStatusId !== status.MaritalStatusId) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <span className="font-medium">{status.Description}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                            No se encontraron estados civiles
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
}
