// src/app/(dashboard)/page.tsx
'use client';

import { useAuthStore } from '@/stores/auth-store';

export default function DashboardPage() {
    const { user } = useAuthStore();

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
                style={{ background: `linear-gradient(135deg, #0277BD 0%, #26A69A 50%, #7CB342 100%)` }}
            >
                <h1 className="text-2xl font-bold">
                    ¡Bienvenid@, {user?.name?.split(' ')[0] || 'Usuario'}! 👋
                </h1>
                <p className="text-white/90 mt-1">
                    Aquí tienes un resumen de tu club de mercancía
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center justify-between">
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full`} style={ stat.positive ? { backgroundColor: 'var(--success-bg)', color: 'var(--success)' } : { backgroundColor: 'var(--error-bg)', color: 'var(--error)' }}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity */}
                <div className="lg:col-span-2 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Actividad Reciente</h2>
                    </div>
                    <div style={{ borderColor: 'var(--border)' }}>
                        {recentActivity.map((item, i) => (
                            <div key={i} className="p-4 flex items-center justify-between transition-colors" style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.action}</p>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.detail}</p>
                                </div>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Acciones Rápidas</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        <a href="/clientes" className="block p-4 rounded-lg border-2 border-dashed transition-all text-center" style={{ borderColor: 'var(--border-accent)' }} onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--info-bg)';}} onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.backgroundColor = 'transparent';}}>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>➕ Nuevo Miembro</span>
                        </a>
                        <a href="/clubes" className="block p-4 rounded-lg border-2 border-dashed transition-all text-center" style={{ borderColor: 'var(--border-accent)' }} onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'var(--secondary)'; e.currentTarget.style.backgroundColor = 'var(--success-bg)';}} onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.backgroundColor = 'transparent';}}>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>🏢 Crear Club</span>
                        </a>
                        <a href="/reportes" className="block p-4 rounded-lg border-2 border-dashed transition-all text-center" style={{ borderColor: 'var(--border-accent)' }} onMouseEnter={(e) => {e.currentTarget.style.borderColor = 'var(--success)'; e.currentTarget.style.backgroundColor = 'var(--success-bg)';}} onMouseLeave={(e) => {e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.backgroundColor = 'transparent';}}>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>📊 Ver Reportes</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}