// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';

const Icons = {
    Home: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Users: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    Customers: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    Club: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    Reports: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    Settings: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Menu: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    Close: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Logout: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    Bell: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    ),
    ChevronLeft: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    ChevronRight: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    ChevronDown: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    Admin: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
    ),
    Products: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    Benefits: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
    ),
    SpecialPrices: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

// Type definitions for navigation
type NavigationItem = {
    name: string;
    icon: () => React.ReactElement;
} & (
    | { href: string; submenu?: never }
    | { submenu: Array<{ name: string; href: string; icon: () => React.ReactElement }>; href?: never }
);

// ✅ Rutas corregidas - sin /dashboard prefix
const navigation: NavigationItem[] = [
    { name: 'Inicio', href: '/', icon: Icons.Home },
    { name: 'Clientes', href: '/clientes', icon: Icons.Customers },
    { name: 'Clubes', href: '/clubes', icon: Icons.Club },
    { name: 'Reportes', href: '/reportes', icon: Icons.Reports },
    {
        name: 'Administración',
        icon: Icons.Admin,
        submenu: [
            { name: 'Usuarios', href: '/usuarios', icon: Icons.Users },
            { name: 'Productos', href: '/productos', icon: Icons.Products },
            { name: 'Beneficios', href: '/beneficios', icon: Icons.Benefits },
            { name: 'Precios especiales', href: '/precios-especiales', icon: Icons.SpecialPrices },
        ]
    },
    { name: 'Configuración', href: '/configuracion', icon: Icons.Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    const { user, isAuthenticated, logout } = useAuthStore();
    const { tenant, clearTenant } = useTenantStore();

    // Esperar a que zustand se hidrate desde sessionStorage
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Solo verificar autenticación después de hidratar
    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isHydrated, isAuthenticated, router]);

    // Auto-expandir submenú si la ruta actual está en él
    useEffect(() => {
        navigation.forEach((item) => {
            if ('submenu' in item && item.submenu) {
                const hasActiveSubmenu = item.submenu.some(
                    (subItem) => pathname.startsWith(subItem.href)
                );
                if (hasActiveSubmenu) {
                    setOpenSubmenu(item.name);
                }
            }
        });
    }, [pathname]);

    // Mostrar loading mientras se hidrata el estado
    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
                <div className="text-center">
                    <div className="w-10 h-10 border-3 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
                </div>
            </div>
        );
    }

    // Después de hidratar, verificar autenticación
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
                <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        clearTenant();
        router.replace('/login');
    };

    // Encontrar el nombre de la página actual
    const currentPage = (() => {
        for (const item of navigation) {
            if ('submenu' in item && item.submenu) {
                const submenuItem = item.submenu.find(sub => pathname.startsWith(sub.href));
                if (submenuItem) return submenuItem.name;
            } else if ('href' in item) {
                if (item.href === '/') {
                    if (pathname === '/') return item.name;
                } else if (pathname.startsWith(item.href)) {
                    return item.name;
                }
            }
        }
        return 'Inicio';
    })();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-20' : 'w-64'}`} style={{ backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)' }}>
                <div className="h-16 flex items-center gap-3 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <img src="/logo.png" alt="Club de Mercancías" className={`h-9 w-auto transition-all ${sidebarCollapsed ? 'mx-auto' : ''}`} />
                    {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-sm" style={{ color: 'var(--text-primary)' }}>Club de Mercancías</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{tenant?.tradeName || tenant?.name || 'Empresa'}</p>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Icons.Close />
                    </button>
                </div>

                <nav className={`p-3 space-y-1 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                    {navigation.map((item) => {
                        // Si el item tiene submenú
                        if ('submenu' in item && item.submenu) {
                            const hasActiveSubmenu = item.submenu.some(
                                (subItem) => pathname.startsWith(subItem.href)
                            );
                            const isOpen = openSubmenu === item.name;

                            if (sidebarCollapsed) {
                                // En modo colapsado, mostrar solo el icono con tooltip
                                return (
                                    <div key={item.name} className="relative group">
                                        <button
                                            className={`flex items-center justify-center p-3 w-12 rounded-lg text-sm font-medium transition-all ${hasActiveSubmenu ? 'text-white shadow-md' : ''}`}
                                            style={hasActiveSubmenu ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { color: 'var(--text-secondary)' }}
                                            onMouseEnter={(e) => !hasActiveSubmenu && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                            onMouseLeave={(e) => !hasActiveSubmenu && (e.currentTarget.style.backgroundColor = 'transparent')}
                                            title={item.name}
                                        >
                                            <item.icon />
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={() => setOpenSubmenu(isOpen ? null : item.name)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${hasActiveSubmenu ? 'text-white shadow-md' : ''}`}
                                        style={hasActiveSubmenu ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { color: 'var(--text-secondary)' }}
                                        onMouseEnter={(e) => !hasActiveSubmenu && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                        onMouseLeave={(e) => !hasActiveSubmenu && (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <item.icon />
                                        <span className="flex-1 text-left">{item.name}</span>
                                        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                            <Icons.ChevronDown />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l-2 pl-2" style={{ borderColor: 'var(--border)' }}>
                                            {item.submenu.map((subItem) => {
                                                const isSubActive = pathname.startsWith(subItem.href);
                                                return (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isSubActive ? 'font-semibold' : 'font-normal'}`}
                                                        style={isSubActive ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary)' } : { color: 'var(--text-secondary)' }}
                                                        onMouseEnter={(e) => !isSubActive && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                                        onMouseLeave={(e) => !isSubActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                                    >
                                                        <subItem.icon />
                                                        {subItem.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Items normales sin submenú
                        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${isActive ? 'text-white shadow-md' : ''} ${sidebarCollapsed ? 'justify-center p-3 w-12' : 'px-3 py-2.5'}`}
                                style={isActive ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' } : { color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--card-hover)')}
                                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                title={sidebarCollapsed ? item.name : undefined}
                            >
                                <item.icon />
                                {!sidebarCollapsed && item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:block absolute -right-3 top-20 p-1.5 rounded-full shadow-lg transition-colors"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    {sidebarCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-3" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                    <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: 'var(--primary)' }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {!sidebarCollapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Usuario'}</p>
                                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                                </div>
                                <button onClick={handleLogout} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'var(--error-bg)';}} onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent';}} title="Cerrar sesión">
                                    <Icons.Logout />
                                </button>
                            </>
                        )}
                        {sidebarCollapsed && (
                            <button onClick={handleLogout} className="absolute -top-12 left-1/2 -translate-x-1/2 p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => {e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'var(--error-bg)';}} onMouseLeave={(e) => {e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent';}} title="Cerrar sesión">
                                <Icons.Logout />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                <header className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Icons.Menu />
                        </button>
                        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{currentPage}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg relative transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Icons.Bell />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--error)' }}></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}