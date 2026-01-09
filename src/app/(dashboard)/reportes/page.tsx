// src/app/(dashboard)/reportes/page.tsx
'use client';

export default function ReportesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reportes</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Membresías, ventas, beneficios y exportación</p>
                </div>
                <button className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--success)' }}>
                    📥 Exportar
                </button>
            </div>

            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--muted-bg)' }}>
                        <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Módulo en desarrollo</h3>
                    <p className="max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Aquí podrás ver reportes de membresías, ventas por club y exportar a Excel/CSV.
                    </p>
                </div>
            </div>
        </div>
    );
}