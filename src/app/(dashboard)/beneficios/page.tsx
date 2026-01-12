// src/app/(dashboard)/beneficios/page.tsx
'use client';

export default function BeneficiosPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Beneficios</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Gestión de beneficios y promociones</p>
                </div>
                <button className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--primary)' }}>
                    + Nuevo Beneficio
                </button>
            </div>

            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--muted-bg)' }}>
                        <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Módulo en desarrollo</h3>
                    <p className="max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Aquí podrás administrar los beneficios, descuentos y promociones especiales para los miembros del club.
                    </p>
                </div>
            </div>
        </div>
    );
}
