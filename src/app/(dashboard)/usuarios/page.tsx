// src/app/(dashboard)/usuarios/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchUsers, type User } from '@/services/userService';

const statusLabels = {
    active: { label: 'Activo', bgColor: 'var(--success-bg)', textColor: 'var(--success)' },
    inactive: { label: 'Inactivo', bgColor: 'var(--muted-bg)', textColor: 'var(--text-muted)' },
};

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        fullName: '',
        idNumber: '',
        email: '',
        userName: '',
        phoneNumber: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Ref para prevenir doble llamado en desarrollo
    const hasLoadedRef = useRef(false);

    // Cargar usuarios desde el API
    const loadUsers = useCallback(async (page: number = 1, search: string = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await searchUsers({
                SearchText: search || null,
                PageNumber: page,
                PageSize: pageSize,
                Email: null,
                IDNumber: null,
                UserName: null
            });

            if (response.Data) {
                setUsuarios(response.Data);
                const count = response.TotalCount || 0;
                setTotalCount(count);
                const calculatedPages = Math.ceil(count / pageSize) || 1;
                setTotalPages(calculatedPages);
                setCurrentPage(page);
            } else {
                setUsuarios([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (err: any) {
            console.error('Error cargando usuarios:', err);
            setError(err.message || 'Error al cargar usuarios');
            setUsuarios([]);
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    }, [pageSize]);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Manejar búsqueda
    const handleSearch = () => {
        setSearchText(searchInput);
        setCurrentPage(1);
        loadUsers(1, searchInput);
    };

    // Manejar cambio de página
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        loadUsers(newPage, searchText);
    };

    // Validar formulario
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            errors.firstName = 'El nombre es obligatorio';
        }
        if (!formData.lastName.trim()) {
            errors.lastName = 'El apellido es obligatorio';
        }
        if (!formData.idNumber.trim()) {
            errors.idNumber = 'El número de identificación es obligatorio';
        }
        if (!formData.email.trim()) {
            errors.email = 'El correo es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'El correo no es válido';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Abrir modal
    const openModal = () => {
        setFormData({
            firstName: '',
            middleName: '',
            lastName: '',
            fullName: '',
            idNumber: '',
            email: '',
            userName: '',
            phoneNumber: ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Cerrar modal
    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            firstName: '',
            middleName: '',
            lastName: '',
            fullName: '',
            idNumber: '',
            email: '',
            userName: '',
            phoneNumber: ''
        });
        setFormErrors({});
    };

    // Guardar usuario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        try {
            // TODO: Implementar llamada al API para crear usuario
            console.log('Datos del formulario:', formData);

            // Simular llamada al API
            await new Promise(resolve => setTimeout(resolve, 1000));

            closeModal();
            setSuccessMessage('Usuario creado exitosamente');
            await loadUsers(1, searchText);
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            console.error('Error guardando usuario:', err);
            setError(err.message || 'Error al guardar usuario');
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Gestión de Usuarios</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Administra el acceso al sistema</p>
                </div>
                {!isModalOpen && (
                    <button
                        onClick={openModal}
                        className="px-4 py-2 text-white rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-glow)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                    >
                        + Nuevo Usuario
                    </button>
                )}
            </div>

            {/* Mensajes de éxito/error */}
            {successMessage && (
                <div className="px-4 py-3 rounded-lg flex items-center" style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="px-4 py-3 rounded-lg flex items-center" style={{ backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)', color: 'var(--error)' }}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto transition-colors"
                        style={{ color: 'var(--error)' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {isModalOpen ? (
                <div className="rounded-xl p-8 shadow-sm relative" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    {isSaving && (
                        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl" style={{ backgroundColor: 'rgba(26, 29, 36, 0.95)' }}>
                            <div className="flex flex-col items-center p-8 rounded-2xl shadow-xl" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border-accent)' }}>
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 rounded-full" style={{ borderColor: 'var(--border)' }}></div>
                                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ borderColor: 'var(--primary)' }}></div>
                                </div>
                                <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Creando usuario</p>
                                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Por favor espere un momento...</p>
                            </div>
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Nombre <span style={{ color: 'var(--error)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: formErrors.firstName ? '1px solid var(--error)' : '1px solid var(--border)',
                                        color: 'var(--text-primary)'
                                    }}
                                    onFocus={(e) => !formErrors.firstName && (e.currentTarget.style.border = '2px solid var(--primary)')}
                                    onBlur={(e) => !formErrors.firstName && (e.currentTarget.style.border = '1px solid var(--border)')}
                                />
                                {formErrors.firstName && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{formErrors.firstName}</p>
                                )}
                            </div>

                            {/* Segundo Nombre */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Segundo Nombre
                                </label>
                                <input
                                    type="text"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                                    onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                                />
                            </div>

                            {/* Apellido */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Apellido <span style={{ color: 'var(--error)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: formErrors.lastName ? '1px solid var(--error)' : '1px solid var(--border)',
                                        color: 'var(--text-primary)'
                                    }}
                                    onFocus={(e) => !formErrors.lastName && (e.currentTarget.style.border = '2px solid var(--primary)')}
                                    onBlur={(e) => !formErrors.lastName && (e.currentTarget.style.border = '1px solid var(--border)')}
                                />
                                {formErrors.lastName && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{formErrors.lastName}</p>
                                )}
                            </div>

                            {/* Nombre Completo */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                                    onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                                />
                            </div>

                            {/* Número ID */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Número de Identificación <span style={{ color: 'var(--error)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="idNumber"
                                    value={formData.idNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: formErrors.idNumber ? '1px solid var(--error)' : '1px solid var(--border)',
                                        color: 'var(--text-primary)'
                                    }}
                                    onFocus={(e) => !formErrors.idNumber && (e.currentTarget.style.border = '2px solid var(--primary)')}
                                    onBlur={(e) => !formErrors.idNumber && (e.currentTarget.style.border = '1px solid var(--border)')}
                                />
                                {formErrors.idNumber && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{formErrors.idNumber}</p>
                                )}
                            </div>

                            {/* Correo */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Correo Electrónico <span style={{ color: 'var(--error)' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{
                                        backgroundColor: 'var(--input-bg)',
                                        border: formErrors.email ? '1px solid var(--error)' : '1px solid var(--border)',
                                        color: 'var(--text-primary)'
                                    }}
                                    onFocus={(e) => !formErrors.email && (e.currentTarget.style.border = '2px solid var(--primary)')}
                                    onBlur={(e) => !formErrors.email && (e.currentTarget.style.border = '1px solid var(--border)')}
                                />
                                {formErrors.email && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{formErrors.email}</p>
                                )}
                            </div>

                            {/* Usuario */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                                    onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                                />
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                                    onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                                />
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={isSaving}
                                className="px-4 py-2.5 rounded-lg font-medium transition-all"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--card)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 text-white"
                                style={{ backgroundColor: 'var(--primary)' }}
                            >
                                Crear Usuario
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    {/* Barra de búsqueda */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Buscar por nombre, email o documento..."
                                className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none transition-all"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                                onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                            />
                            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 text-white rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--primary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-glow)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                        >
                            Buscar
                        </button>
                        <button
                            onClick={() => loadUsers(currentPage, searchText)}
                            className="px-4 py-2 rounded-lg transition-colors"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Actualizar lista"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="flex flex-col items-center p-8 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border-accent)' }}>
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 rounded-full" style={{ borderColor: 'var(--border)' }}></div>
                                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ borderColor: 'var(--primary)' }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-5 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Cargando usuarios</p>
                                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Por favor espere un momento...</p>
                                <div className="mt-4 flex space-x-1.5">
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary)', animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    ) : usuarios.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    Usuarios Registrados
                                    <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
                                        ({totalCount} total)
                                    </span>
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full" style={{ borderColor: 'var(--border)' }}>
                                    <thead style={{ backgroundColor: 'var(--card-hover)' }}>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Nombre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Correo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Documento
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Teléfono
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                Estado
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderColor: 'var(--border)' }}>
                                        {usuarios.map((user) => (
                                            <tr key={user.UserId} className="transition-colors" style={{ borderTop: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: 'var(--primary)' }}>
                                                            {user.FirstName?.charAt(0) || user.Email?.charAt(0) || 'U'}
                                                        </div>
                                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                            {user.FirstName && user.LastName ? `${user.FirstName} ${user.LastName}` : user.FullName || user.UserName || 'Sin nombre'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {user.Email || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {user.IDNumber || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    {user.PhoneNumber || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{
                                                        backgroundColor: user.Active !== false ? statusLabels.active.bgColor : statusLabels.inactive.bgColor,
                                                        color: user.Active !== false ? statusLabels.active.textColor : statusLabels.inactive.textColor
                                                    }}>
                                                        {user.Active !== false ? statusLabels.active.label : statusLabels.inactive.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className="flex justify-between items-center pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Mostrando {usuarios.length} de {totalCount} usuarios - Página {currentPage} de {totalPages}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="px-2 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        title="Primera página"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Anterior
                                    </button>

                                    {/* Números de página */}
                                    <div className="flex gap-1 mx-2">
                                        {(() => {
                                            const pages = [];
                                            let startPage = Math.max(1, currentPage - 2);
                                            let endPage = Math.min(totalPages, currentPage + 2);

                                            if (endPage - startPage < 4) {
                                                if (startPage === 1) {
                                                    endPage = Math.min(totalPages, startPage + 4);
                                                } else if (endPage === totalPages) {
                                                    startPage = Math.max(1, endPage - 4);
                                                }
                                            }

                                            for (let i = startPage; i <= endPage; i++) {
                                                const isActive = currentPage === i;
                                                pages.push(
                                                    <button
                                                        key={i}
                                                        onClick={() => handlePageChange(i)}
                                                        className={`min-w-[36px] px-3 py-1 border rounded-lg text-sm font-medium transition-colors`}
                                                        style={isActive ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderColor: 'var(--primary)' } : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                                                        onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                                        onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                                    >
                                                        {i}
                                                    </button>
                                                );
                                            }
                                            return pages;
                                        })()}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Siguiente
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-2 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        title="Última página"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--card-hover)' }}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                {searchText ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                            </h3>
                            <p className="max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                {searchText
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Comienza registrando tu primer usuario haciendo clic en el botón "Nuevo Usuario".'
                                }
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
