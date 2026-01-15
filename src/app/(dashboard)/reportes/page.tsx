// src/app/(dashboard)/reportes/page.tsx
'use client';

import { useState } from 'react';
import { clubApi } from '@/lib/api/clubs';

export default function ReportesPage() {
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate) return;

        setIsLoading(true);
        try {
            // Convertir la fecha a formato ISO con hora 06:00:00 UTC
            const dateObj = new Date(selectedDate);
            dateObj.setUTCHours(6, 0, 0, 0);
            const isoDate = dateObj.toISOString();

            const response = await clubApi.getReport1(isoDate);

            console.log('Respuesta completa:', response);

            // Obtener el nombre del archivo desde los headers
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'Ganadores_Club_Mercancia.xlsx';

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Crear un blob y descargarlo
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('✅ Reporte descargado:', filename);
        } catch (error) {
            console.error('Error al generar reporte:', error);
            alert('Error al generar el reporte');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reportes</h1>
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Membresías, ventas, beneficios y exportación</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Formulario: Ganadores de club de mercancía */}
                <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                    <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Ganadores de club de mercancía
                    </h2>

                    <form onSubmit={handleGenerateReport} className="space-y-3">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Fecha del sorteo
                            </label>
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)'
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                        >
                            {isLoading ? '⏳ Generando...' : '📥 Generar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}