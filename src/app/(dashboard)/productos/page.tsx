// src/app/(dashboard)/productos/page.tsx
'use client';

export default function ProductosPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Productos</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Gestión de productos del club</p>
                </div>
                <button className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--primary)' }}>
                    + Nuevo Producto
                </button>
            </div>

            <div className="rounded-xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--muted-bg)' }}>
                        <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Módulo en desarrollo</h3>
                    <p className="max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Aquí podrás gestionar el catálogo de productos del club, precios, stock y categorías.
                    </p>
                </div>
            </div>
        </div>
    );
}
