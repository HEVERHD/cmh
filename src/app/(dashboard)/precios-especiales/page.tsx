// src/app/(dashboard)/precios-especiales/page.tsx
'use client';

export default function PreciosEspecialesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Precios Especiales</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Gestión de precios especiales y tarifas personalizadas</p>
                </div>
                <button className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--primary)' }}>
                    + Nuevo Precio
                </button>
            </div>

            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--muted-bg)' }}>
                        <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Módulo en desarrollo</h3>
                    <p className="max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Aquí podrás configurar precios especiales por club, cliente o producto, y gestionar tarifas personalizadas.
                    </p>
                </div>
            </div>
        </div>
    );
}
