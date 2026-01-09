'use client';

import { useState, useEffect, useRef } from 'react';
import { getNationalities, Nationality } from '@/services/nationalityService';

interface NationalitySelectorProps {
    value: string;
    onChange: (description: string) => void;
    error?: string;
    required?: boolean;
}

export default function NationalitySelector({ value, onChange, error, required }: NationalitySelectorProps) {
    const [nationalities, setNationalities] = useState<Nationality[]>([]);
    const [filteredNationalities, setFilteredNationalities] = useState<Nationality[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNationality, setSelectedNationality] = useState<Nationality | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchNationalities = async () => {
            setIsLoading(true);
            try {
                const data = await getNationalities();
                setNationalities(data);
                setFilteredNationalities(data);
            } catch (error) {
                console.error('Error loading nationalities:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNationalities();
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
        // Si hay un valor inicial, buscar la nacionalidad correspondiente
        if (value && nationalities.length > 0 && !selectedNationality) {
            const nationality = nationalities.find(n => n.Description === value);
            if (nationality) {
                setSelectedNationality(nationality);
                setSearchTerm(nationality.Description);
            }
        }
    }, [value, nationalities]);

    useEffect(() => {
        // Filtrar nacionalidades según el término de búsqueda
        if (searchTerm.trim() === '') {
            setFilteredNationalities(nationalities);
        } else {
            const normalizeText = (text: string) => {
                return text
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            };

            const normalizedSearch = normalizeText(searchTerm);
            const filtered = nationalities.filter(nationality =>
                normalizeText(nationality.Description).includes(normalizedSearch)
            );
            setFilteredNationalities(filtered);
        }
    }, [searchTerm, nationalities]);

    const handleSelect = (nationality: Nationality) => {
        setSelectedNationality(nationality);
        setSearchTerm(nationality.Description);
        onChange(nationality.Description);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);

        // Si el usuario borra todo, limpiar la selección
        if (newValue === '') {
            setSelectedNationality(null);
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
                    placeholder={isLoading ? 'Cargando nacionalidades...' : 'Buscar nacionalidad...'}
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
                    {filteredNationalities.length > 0 ? (
                        <ul className="py-1">
                            {filteredNationalities.map((nationality) => (
                                <li key={nationality.NationalityId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(nationality)}
                                        className="w-full text-left px-4 py-2 transition-colors"
                                        style={{
                                            backgroundColor: selectedNationality?.NationalityId === nationality.NationalityId ? 'var(--primary-light)' : 'transparent',
                                            color: selectedNationality?.NationalityId === nationality.NationalityId ? 'var(--primary)' : 'var(--text-primary)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedNationality?.NationalityId !== nationality.NationalityId) {
                                                e.currentTarget.style.backgroundColor = 'var(--card-hover)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedNationality?.NationalityId !== nationality.NationalityId) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <span className="font-medium">{nationality.Description}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                            No se encontraron nacionalidades
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
