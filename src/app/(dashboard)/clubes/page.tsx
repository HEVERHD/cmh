// src/app/(dashboard)/clubes/page.tsx
'use client';

export default function ClubesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Clubes</h1>
                    <p className="text-gray-500 mt-1">Crea y administra clubes, reglas y beneficios</p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    + Nuevo Club
                </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Módulo en desarrollo</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Aquí podrás crear clubes, definir reglas de puntos/cashback y gestionar beneficios.
                    </p>
                </div>
            </div>
        </div>
    );
}