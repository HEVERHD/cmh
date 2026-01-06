// src/app/(dashboard)/usuarios/page.tsx
'use client';

import { useState } from 'react';
import { useTenantStore } from '@/stores/tenant-store';

// Tipos
interface Usuario {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'operator' | 'analyst';
    status: 'active' | 'inactive';
    createdAt: string;
}

// Datos de ejemplo
const usuariosDemo: Usuario[] = [
    { id: '1', name: 'Carlos Administrador', email: 'carlos@empresa.com', role: 'admin', status: 'active', createdAt: '2024-01-15' },
    { id: '2', name: 'María Operadora', email: 'maria@empresa.com', role: 'operator', status: 'active', createdAt: '2024-02-20' },
    { id: '3', name: 'Juan Analista', email: 'juan@empresa.com', role: 'analyst', status: 'active', createdAt: '2024-03-10' },
    { id: '4', name: 'Ana García', email: 'ana@empresa.com', role: 'operator', status: 'inactive', createdAt: '2024-01-05' },
];

const roleLabels = {
    admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
    operator: { label: 'Operador', color: 'bg-blue-100 text-blue-700' },
    analyst: { label: 'Analista', color: 'bg-green-100 text-green-700' },
};

const statusLabels = {
    active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
    inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-600' },
};

export default function UsuariosPage() {
    const { tenant } = useTenantStore();
    const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosDemo);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);

    // Form state
    const [formData, setFormData] = useState({ name: '', email: '', role: 'operator' as Usuario['role'], status: 'active' as Usuario['status'] });

    const primaryColor = tenant?.branding?.primaryColor || '#3B82F6';

    // Filtrar usuarios
    const filteredUsers = usuarios.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'operator', status: 'active' });
        setIsModalOpen(true);
    };

    const openEditModal = (user: Usuario) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingUser) {
            setUsuarios(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        } else {
            const newUser: Usuario = { id: Date.now().toString(), ...formData, createdAt: new Date().toISOString().split('T')[0] };
            setUsuarios(prev => [newUser, ...prev]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            setUsuarios(prev => prev.filter(u => u.id !== id));
        }
    };

    const toggleStatus = (id: string) => {
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-500 mt-1">Administra el acceso al sistema</p>
                </div>
                <button onClick={openCreateModal} className="px-4 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg" style={{ backgroundColor: primaryColor }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Nuevo Usuario
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="all">Todos los roles</option>
                    <option value="admin">Administradores</option>
                    <option value="operator">Operadores</option>
                    <option value="analyst">Analistas</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creado</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: primaryColor }}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${roleLabels[user.role].color}`}>
                                            {roleLabels[user.role].label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleStatus(user.id)} className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusLabels[user.status].color}`}>
                                            {statusLabels[user.status].label}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.createdAt}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No se encontraron usuarios</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-900">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Juan Pérez" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="juan@empresa.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select value={formData.role} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value as Usuario['role'] }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                                    <option value="admin">Administrador - Acceso completo</option>
                                    <option value="operator">Operador - Clientes y ventas</option>
                                    <option value="analyst">Analista - Solo reportes</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors">Cancelar</button>
                            <button onClick={handleSave} disabled={!formData.name || !formData.email} className="px-4 py-2.5 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50" style={{ backgroundColor: primaryColor }}>
                                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}