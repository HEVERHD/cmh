// src/app/(dashboard)/page.tsx
'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { tenant } = useTenantStore();

    const primaryColor = tenant?.branding?.primaryColor || '#3B82F6';
    const secondaryColor = tenant?.branding?.secondaryColor || '#1E40AF';

    const stats = [
        { label: 'Miembros Activos', value: '1,234', change: '+12%', positive: true },
        { label: 'Clubes Activos', value: '8', change: '+2', positive: true },
        { label: 'Ventas del Mes', value: '$45,678', change: '+8.2%', positive: true },
        { label: 'Beneficios Canjeados', value: '567', change: '+23%', positive: true },
    ];

    const recentActivity = [
        { action: 'Nuevo miembro registrado', detail: 'Juan Pérez', time: 'Hace 5 min' },
        { action: 'Beneficio canjeado', detail: '2x1 en lácteos', time: 'Hace 15 min' },
        { action: 'Club actualizado', detail: 'Club Premium', time: 'Hace 1 hora' },
        { action: 'Nueva compra', detail: '$125.50', time: 'Hace 2 horas' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div
                className="rounded-2xl p-6 text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
                <h1 className="text-2xl font-bold">
                    ¡Bienvenido, {user?.name?.split(' ')[0] || 'Usuario'}! 👋
                </h1>
                <p className="text-white/80 mt-1">
                    Aquí tienes un resumen de tu club de mercancía
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-5 border-b">
                        <h2 className="font-semibold text-gray-900">Actividad Reciente</h2>
                    </div>
                    <div className="divide-y">
                        {recentActivity.map((item, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                                    <p className="text-sm text-gray-500">{item.detail}</p>
                                </div>
                                <span className="text-xs text-gray-400">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-5 border-b">
                        <h2 className="font-semibold text-gray-900">Acciones Rápidas</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        <a href="/clientes" className="block p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center">
                            <span className="text-sm font-medium text-gray-700">➕ Nuevo Miembro</span>
                        </a>
                        <a href="/clubes" className="block p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-center">
                            <span className="text-sm font-medium text-gray-700">🏢 Crear Club</span>
                        </a>
                        <a href="/reportes" className="block p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-center">
                            <span className="text-sm font-medium text-gray-700">📊 Ver Reportes</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}