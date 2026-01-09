"use client";

import { useState, useEffect, useRef } from "react";
import { getGenders, Gender } from "@/services/genderService";

interface GenderSelectorProps {
  value: string;
  onChange: (genderDescription: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
}

export default function GenderSelector({
  value,
  onChange,
  onBlur,
  error,
  required,
}: GenderSelectorProps) {
  const [genders, setGenders] = useState<Gender[]>([]);
  const [filteredGenders, setFilteredGenders] = useState<Gender[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchGenders = async () => {
      setIsLoading(true);
      try {
        const data = await getGenders();
        setGenders(data);
        setFilteredGenders(data);
      } catch (error) {
        console.error("Error loading genders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenders();
  }, []);

  useEffect(() => {
    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Si hay un valor inicial, buscar el género correspondiente
    if (value && genders.length > 0 && !selectedGender) {
      const gender = genders.find((g) => g.Description === value);
      if (gender) {
        setSelectedGender(gender);
        setSearchTerm(gender.Description);
      }
    }
  }, [value, genders, selectedGender]);

  useEffect(() => {
    // Filtrar géneros según el término de búsqueda
    if (searchTerm.trim() === "") {
      setFilteredGenders(genders);
    } else {
      const normalizeText = (text: string) => {
        return text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      };

      const normalizedSearch = normalizeText(searchTerm);
      const filtered = genders.filter((gender) =>
        normalizeText(gender.Description).includes(normalizedSearch)
      );
      setFilteredGenders(filtered);
    }
  }, [searchTerm, genders]);

  const handleSelect = (gender: Gender) => {
    setSelectedGender(gender);
    setSearchTerm(gender.Description);
    onChange(gender.Description);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);

    // Si el usuario borra todo, limpiar la selección
    if (newValue === "") {
      setSelectedGender(null);
      onChange("");
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Mostrar todos los géneros cuando se abre el dropdown
    setFilteredGenders(genders);
  };

  const handleInputBlur = () => {
    // Validar que el texto ingresado corresponda a un género válido
    setTimeout(() => {
      if (!selectedGender && searchTerm) {
        // Si hay texto pero no hay selección válida, limpiar
        const matchingGender = genders.find(
          (g) => g.Description.toLowerCase() === searchTerm.toLowerCase()
        );
        if (matchingGender) {
          setSelectedGender(matchingGender);
          setSearchTerm(matchingGender.Description);
          onChange(matchingGender.Description);
        } else {
          setSearchTerm("");
          onChange("");
        }
      }
      onBlur?.();
    }, 200);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={isLoading ? "Cargando géneros..." : "Buscar género..."}
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
          style={{
            backgroundColor: isLoading ? 'var(--muted-bg)' : 'var(--input-bg)',
            border: error ? '1px solid var(--error)' : '1px solid var(--border)',
            color: 'var(--text-primary)',
            cursor: isLoading ? 'not-allowed' : 'text'
          }}
          onFocusCapture={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-5 h-5 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
            style={{ color: 'var(--text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
          {filteredGenders.length > 0 ? (
            <ul className="py-1">
              {filteredGenders.map((gender) => (
                <li key={gender.GenderId}>
                  <button
                    type="button"
                    onClick={() => handleSelect(gender)}
                    className="w-full text-left px-4 py-2 transition-colors"
                    style={{
                      backgroundColor: selectedGender?.GenderId === gender.GenderId ? 'var(--primary-light)' : 'transparent',
                      color: selectedGender?.GenderId === gender.GenderId ? 'var(--primary)' : 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedGender?.GenderId !== gender.GenderId) {
                        e.currentTarget.style.backgroundColor = 'var(--card-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedGender?.GenderId !== gender.GenderId) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="font-medium">{gender.Description}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              No se encontraron géneros
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
