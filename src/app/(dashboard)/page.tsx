// src/app/(dashboard)/page.tsx
'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useDraws } from '@/lib/hooks/useClubs';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO, isPast, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState, useCallback } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { data: draws, isLoading: isLoadingDraws } = useDraws();

    // Estado para controlar la vista y fecha del calendario
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<View>('month');
    const [selectedDraw, setSelectedDraw] = useState<any>(null);

    // Calcular sorteos del mes actual
    const sorteosDelMes = useMemo(() => {
        if (!draws || !Array.isArray(draws)) return 0;

        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        return draws.filter(draw => {
            const drawDate = parseISO(draw.date);
            return isWithinInterval(drawDate, { start: monthStart, end: monthEnd });
        }).length;
    }, [draws]);

    const stats = [
        { label: 'Sorteos del mes', value: sorteosDelMes.toString(), change: '🎟️', positive: true },
    ];

    // Transform draws into calendar events
    const events = useMemo(() => {
        if (!draws || !Array.isArray(draws)) return [];

        return draws.map((draw) => {
            const drawDate = parseISO(draw.date);
            const dateHasPassed = isPast(drawDate);
            const hasNumberPlayed = draw.numberPlayed !== undefined && draw.numberPlayed !== null;

            const isRealized = dateHasPassed && hasNumberPlayed;
            let title = 'Sorteo disponible';
            if (isRealized) {
                title = `Sorteo realizado\nGanador: ${draw.numberPlayed} 🏆`;
            }

            return {
                id: draw.drawId,
                title,
                start: drawDate,
                end: drawDate,
                allDay: true,
                resource: { ...draw, isRealized },
            };
        });
    }, [draws]);

    // Custom event style getter
    const eventStyleGetter = (event: any) => {
        const isRealized = event.resource?.isRealized;

        return {
            style: {
                backgroundColor: isRealized ? 'var(--success)' : 'var(--primary)',
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                fontSize: '0.875rem',
                padding: '4px 8px',
                fontWeight: '500',
                whiteSpace: 'normal',
                overflow: 'visible',
                textOverflow: 'clip',
                lineHeight: '1.2',
            }
        };
    };

    // Manejadores de navegación del calendario
    const handleNavigate = useCallback((newDate: Date) => {
        setCurrentDate(newDate);
    }, []);

    const handleViewChange = useCallback((newView: View) => {
        setCurrentView(newView);
    }, []);

    // Manejador para abrir el modal de detalles del sorteo
    const handleSelectEvent = useCallback((event: any) => {
        setSelectedDraw(event.resource);
    }, []);

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

            {/* Calendar Section */}
            <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', minHeight: '700px' }}>
                <div className="mb-4">
                    <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                        Calendario de Sorteos
                    </h2>
                </div>
                {isLoadingDraws ? (
                    <div className="flex justify-center items-center py-16">
                        <div
                            className="flex flex-col items-center p-8 rounded-2xl shadow-sm"
                            style={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border-accent)',
                            }}
                        >
                            <div className="relative">
                                <div
                                    className="w-16 h-16 border-4 rounded-full"
                                    style={{ borderColor: 'var(--border)' }}
                                ></div>
                                <div
                                    className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0"
                                    style={{ borderColor: 'var(--primary)' }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ color: 'var(--primary)' }}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p
                                className="mt-5 text-lg font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Cargando sorteos
                            </p>
                            <p
                                className="mt-2 text-sm text-center max-w-xs"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Obteniendo información del calendario...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <style jsx global>{`
                            .rbc-calendar {
                                font-family: inherit;
                                color: var(--text-primary);
                            }
                            .rbc-header {
                                padding: 12px 4px;
                                font-weight: 600;
                                font-size: 0.875rem;
                                color: var(--text-primary);
                                border-bottom: 2px solid var(--border);
                                background-color: var(--card-hover);
                            }
                            .rbc-month-view {
                                border: 1px solid var(--border);
                                border-radius: 8px;
                                overflow: hidden;
                                background-color: var(--card);
                            }
                            .rbc-month-row {
                                border-color: var(--border);
                            }
                            .rbc-day-bg {
                                border-color: var(--border);
                            }
                            .rbc-day-bg:hover {
                                background-color: var(--card-hover);
                            }
                            .rbc-off-range-bg {
                                background-color: var(--input-bg);
                            }
                            .rbc-today {
                                background-color: var(--info-bg);
                            }
                            .rbc-date-cell {
                                padding: 8px;
                                text-align: right;
                            }
                            .rbc-button-link {
                                color: var(--text-primary);
                                font-weight: 500;
                            }
                            .rbc-toolbar {
                                padding: 16px;
                                margin-bottom: 16px;
                                border-radius: 8px;
                                background-color: var(--card-hover);
                                border: 1px solid var(--border);
                            }
                            .rbc-toolbar button {
                                color: var(--text-primary);
                                border: 1px solid var(--border);
                                background-color: var(--card);
                                padding: 8px 16px;
                                border-radius: 6px;
                                font-weight: 500;
                                transition: all 0.2s;
                            }
                            .rbc-toolbar button:hover {
                                background-color: var(--primary);
                                color: white;
                                border-color: var(--primary);
                            }
                            .rbc-toolbar button:active,
                            .rbc-toolbar button.rbc-active {
                                background-color: var(--primary);
                                color: white;
                                border-color: var(--primary);
                            }
                            .rbc-toolbar-label {
                                font-weight: 600;
                                font-size: 1.125rem;
                                color: var(--text-primary);
                            }
                            .rbc-event {
                                padding: 4px 8px;
                                border-radius: 6px;
                                font-size: 0.875rem;
                            }
                            .rbc-event-content {
                                white-space: normal !important;
                                overflow: visible !important;
                                text-overflow: clip !important;
                                line-height: 1.2;
                            }
                            .rbc-show-more {
                                color: var(--primary);
                                font-weight: 500;
                                padding: 4px 8px;
                                background-color: var(--info-bg);
                                border-radius: 4px;
                                margin-top: 4px;
                            }
                            .rbc-show-more:hover {
                                background-color: var(--primary);
                                color: white;
                            }
                        `}</style>
                        <div style={{ height: '600px' }}>
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                culture="es"
                                date={currentDate}
                                view={currentView}
                                onNavigate={handleNavigate}
                                onView={handleViewChange}
                                onSelectEvent={handleSelectEvent}
                                eventPropGetter={eventStyleGetter}
                                messages={{
                                    next: "Siguiente",
                                    previous: "Anterior",
                                    today: "Hoy",
                                    month: "Mes",
                                    week: "Semana",
                                    day: "Día",
                                    agenda: "Agenda",
                                    date: "Fecha",
                                    time: "Hora",
                                    event: "Sorteo",
                                    noEventsInRange: "No hay sorteos en este rango de fechas.",
                                    showMore: (total: number) => `+ Ver más (${total})`
                                }}
                                style={{ height: '100%' }}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Modal de Detalles del Sorteo */}
            {selectedDraw && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div
                        className="rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 pointer-events-auto"
                        style={{ backgroundColor: 'var(--card)', border: '2px solid var(--border)' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Detalles del Sorteo
                            </h3>
                            <button
                                onClick={() => setSelectedDraw(null)}
                                className="rounded-lg p-2 transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Fecha
                                </label>
                                <p className="mt-1 text-base" style={{ color: 'var(--text-primary)' }}>
                                    {format(parseISO(selectedDraw.date), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Hora
                                </label>
                                <p className="mt-1 text-base" style={{ color: 'var(--text-primary)' }}>
                                    {format(parseISO(selectedDraw.date), 'HH:mm:ss', { locale: es })}
                                </p>
                            </div>

                            {selectedDraw.numberPlayed !== undefined && selectedDraw.numberPlayed !== null && (
                                <div>
                                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        Número jugado
                                    </label>
                                    <p className="mt-1 text-base font-semibold" style={{ color: 'var(--success)' }}>
                                        🏆 {selectedDraw.numberPlayed}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Comentarios
                                </label>
                                <p className="mt-1 text-base" style={{ color: 'var(--text-primary)' }}>
                                    {selectedDraw.comment || 'Sin comentarios'}
                                </p>
                            </div>

                            {!selectedDraw.numberPlayed && (
                                <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--info-bg)' }}>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Este sorteo aún no se ha realizado
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedDraw(null)}
                                className="px-4 py-2 rounded-lg font-medium transition-colors"
                                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-glow)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}