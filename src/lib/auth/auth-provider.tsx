// src/lib/auth/auth-provider.tsx
'use client';

import { useEffect, createContext, useContext, ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';

interface AuthContextType {
    isReady: boolean;
}

const AuthContext = createContext<AuthContextType>({ isReady: false });

// Rutas públicas
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();
    const { tenant, isValidated } = useTenantStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Esperar hidratación de Zustand persist
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    // Mostrar loading solo si no está hidratado
    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isReady: isHydrated }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);