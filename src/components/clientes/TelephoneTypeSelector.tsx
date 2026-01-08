'use client';

import { useState, useEffect, useRef } from 'react';
import { getTelephoneTypes, TelephoneType } from '@/services/telephoneTypeService';

export interface TelephoneTypeSelection {
    telephoneTypeId: string;
    description: string;
}

interface TelephoneTypeSelectorProps {
    value: string; // telephoneTypeId
    onChange: (selection: TelephoneTypeSelection) => void;
    error?: string;
    required?: boolean;
}

export default function TelephoneTypeSelector({ value, onChange, error, required }: TelephoneTypeSelectorProps) {
    const [telephoneTypes, setTelephoneTypes] = useState<TelephoneType[]>([]);
    const [filteredTelephoneTypes, setFilteredTelephoneTypes] = useState<TelephoneType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTelephoneType, setSelectedTelephoneType] = useState<TelephoneType | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hasLoadedRef = useRef(false);
    const onChangeRef = useRef(onChange);

    // Mantener ref actualizado
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        // Solo cargar una vez
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        const fetchTelephoneTypes = async () => {
            setIsLoading(true);
            try {
                const data = await getTelephoneTypes();
                setTelephoneTypes(data);
                setFilteredTelephoneTypes(data);

                // Seleccionar el primer tipo por defecto
                if (data.length > 0) {
                    const firstType = data[0];
                    setSelectedTelephoneType(firstType);
                    setSearchTerm(firstType.Description);
                    setTimeout(() => {
                        onChangeRef.current({
                            telephoneTypeId: firstType.TelephoneTypeId,
                            description: firstType.Description
                        });
                    }, 0);
                }
            } catch (error) {
                console.error('Error loading telephone types:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTelephoneTypes();
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
        // Si hay un valor inicial, buscar el tipo correspondiente
        if (value && telephoneTypes.length > 0 && !selectedTelephoneType) {
            const telType = telephoneTypes.find(t => t.TelephoneTypeId === value);
            if (telType) {
                setSelectedTelephoneType(telType);
                setSearchTerm(telType.Description);
            }
        }
    }, [value, telephoneTypes, selectedTelephoneType]);

    useEffect(() => {
        // Filtrar tipos según el término de búsqueda
        if (searchTerm.trim() === '') {
            setFilteredTelephoneTypes(telephoneTypes);
        } else {
            const normalizeText = (text: string) => {
                return text
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            };

            const normalizedSearch = normalizeText(searchTerm);
            const filtered = telephoneTypes.filter(telType =>
                normalizeText(telType.Description).includes(normalizedSearch)
            );
            setFilteredTelephoneTypes(filtered);
        }
    }, [searchTerm, telephoneTypes]);

    const handleSelect = (telType: TelephoneType) => {
        setSelectedTelephoneType(telType);
        setSearchTerm(telType.Description);
        onChange({
            telephoneTypeId: telType.TelephoneTypeId,
            description: telType.Description
        });
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);

        if (newValue === '') {
            setSelectedTelephoneType(null);
            onChange({
                telephoneTypeId: '',
                description: ''
            });
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        setFilteredTelephoneTypes(telephoneTypes);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={isLoading ? 'Cargando tipos...' : 'Seleccionar tipo de teléfono...'}
                    disabled={isLoading}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && !isLoading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredTelephoneTypes.length > 0 ? (
                        <ul className="py-1">
                            {filteredTelephoneTypes.map((telType) => (
                                <li key={telType.TelephoneTypeId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(telType)}
                                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                                            selectedTelephoneType?.TelephoneTypeId === telType.TelephoneTypeId
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        <span className="font-medium">{telType.Description}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No se encontraron tipos de teléfono
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
