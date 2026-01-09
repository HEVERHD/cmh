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
                    {filteredLevels.length > 0 ? (
                        <ul className="py-1">
                            {filteredLevels.map((level) => (
                                <li key={level.EducationalLevelId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(level)}
                                        className="w-full text-left px-4 py-2 transition-colors"
                                        style={{
                                            backgroundColor: selectedLevel?.EducationalLevelId === level.EducationalLevelId ? 'var(--primary-light)' : 'transparent',
                                            color: selectedLevel?.EducationalLevelId === level.EducationalLevelId ? 'var(--primary)' : 'var(--text-primary)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedLevel?.EducationalLevelId !== level.EducationalLevelId) {
                                                e.currentTarget.style.backgroundColor = 'var(--card-hover)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedLevel?.EducationalLevelId !== level.EducationalLevelId) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <span className="font-medium">{level.Description}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
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
