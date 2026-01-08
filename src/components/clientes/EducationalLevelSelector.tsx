'use client';

import { useState, useEffect, useRef } from 'react';
import { getEducationalLevels, EducationalLevel } from '@/services/educationalLevelService';

interface EducationalLevelSelectorProps {
    value: string;
    onChange: (levelDescription: string) => void;
    error?: string;
    required?: boolean;
}

export default function EducationalLevelSelector({
    value,
    onChange,
    error,
    required
}: EducationalLevelSelectorProps) {
    const [levels, setLevels] = useState<EducationalLevel[]>([]);
    const [filteredLevels, setFilteredLevels] = useState<EducationalLevel[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState<EducationalLevel | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchLevels = async () => {
            setIsLoading(true);
            try {
                const data = await getEducationalLevels();
                setLevels(data);
                setFilteredLevels(data);
            } catch (error) {
                console.error('Error loading educational levels:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLevels();
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
        // Si hay un valor inicial, buscar el nivel correspondiente
        if (value && levels.length > 0 && !selectedLevel) {
            const level = levels.find(l => l.Description === value);
            if (level) {
                setSelectedLevel(level);
                setSearchTerm(level.Description);
            }
        }
    }, [value, levels, selectedLevel]);

    useEffect(() => {
        // Filtrar niveles según el término de búsqueda
        if (searchTerm.trim() === '') {
            setFilteredLevels(levels);
        } else {
            const normalizeText = (text: string) => {
                return text
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            };

            const normalizedSearch = normalizeText(searchTerm);
            const filtered = levels.filter(level =>
                normalizeText(level.Description).includes(normalizedSearch)
            );
            setFilteredLevels(filtered);
        }
    }, [searchTerm, levels]);

    const handleSelect = (level: EducationalLevel) => {
        setSelectedLevel(level);
        setSearchTerm(level.Description);
        onChange(level.Description);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);

        // Si el usuario borra todo, limpiar la selección
        if (newValue === '') {
            setSelectedLevel(null);
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
                    placeholder={isLoading ? 'Cargando niveles educativos...' : 'Buscar nivel educativo...'}
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
                    {filteredLevels.length > 0 ? (
                        <ul className="py-1">
                            {filteredLevels.map((level) => (
                                <li key={level.EducationalLevelId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(level)}
                                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                                            selectedLevel?.EducationalLevelId === level.EducationalLevelId
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        <span className="font-medium">{level.Description}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No se encontraron niveles educativos
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
