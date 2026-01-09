'use client';

import { useState, useEffect, useRef } from 'react';
import { getCountries, Country } from '@/services/countryService';

interface CountrySelectorProps {
    value: string;
    onChange: (countryName: string) => void;
    error?: string;
    required?: boolean;
}

export default function CountrySelector({ value, onChange, error, required }: CountrySelectorProps) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchCountries = async () => {
            setIsLoading(true);
            try {
                const data = await getCountries();
                setCountries(data);
                setFilteredCountries(data);
            } catch (error) {
                console.error('Error loading countries:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCountries();
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
        // Si hay un valor inicial, buscar el país correspondiente
        if (value && countries.length > 0 && !selectedCountry) {
            const country = countries.find(c => c.Name === value);
            if (country) {
                setSelectedCountry(country);
                setSearchTerm(country.Name);
            }
        }
    }, [value, countries]);

    useEffect(() => {
        // Filtrar países según el término de búsqueda
        if (searchTerm.trim() === '') {
            setFilteredCountries(countries);
        } else {
            const normalizeText = (text: string) => {
                return text
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            };

            const normalizedSearch = normalizeText(searchTerm);
            const filtered = countries.filter(country =>
                normalizeText(country.Name).includes(normalizedSearch)
            );
            setFilteredCountries(filtered);
        }
    }, [searchTerm, countries]);

    const handleSelect = (country: Country) => {
        setSelectedCountry(country);
        setSearchTerm(country.Name);
        onChange(country.Name);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setIsOpen(true);

        // Si el usuario borra todo, limpiar la selección
        if (newValue === '') {
            setSelectedCountry(null);
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
                    placeholder={isLoading ? 'Cargando países...' : 'Buscar país...'}
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
                    {filteredCountries.length > 0 ? (
                        <ul className="py-1">
                            {filteredCountries.map((country) => (
                                <li key={country.CountryId}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(country)}
                                        className="w-full text-left px-4 py-2 transition-colors"
                                        style={{
                                            backgroundColor: selectedCountry?.CountryId === country.CountryId ? 'var(--primary-light)' : 'transparent',
                                            color: selectedCountry?.CountryId === country.CountryId ? 'var(--primary)' : 'var(--text-primary)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedCountry?.CountryId !== country.CountryId) {
                                                e.currentTarget.style.backgroundColor = 'var(--card-hover)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedCountry?.CountryId !== country.CountryId) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{country.Name}</span>
                                            {country.Code && (
                                                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                                                    {country.Code}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                            No se encontraron países
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
