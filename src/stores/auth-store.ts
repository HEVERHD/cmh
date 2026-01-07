// src/stores/auth-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { loginUser, getErrorMessage, LoginParams } from '@/lib/api/client';
import type { User, AuthTokens, AuthState } from '@/types/auth';

interface AuthStore extends AuthState {
    login: (params: LoginParams) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    clearError: () => void;
    hasPermission: (permission: string) => boolean;
}

// Helper para normalizar roles a strings
const normalizeRoles = (rawRoles: any[]): string[] => {
    if (!Array.isArray(rawRoles)) return [];

    return rawRoles.map((r) => {
        if (typeof r === 'string') return r;
        if (typeof r === 'object' && r !== null) {
            // Manejar diferentes formatos: { Name: 'Admin' }, { RoleName: 'Admin' }, etc.
            return r.Name || r.RoleName || r.name || r.roleName || r.value || JSON.stringify(r);
        }
        return String(r);
    }).filter(Boolean);
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (params: LoginParams) => {
                set({ isLoading: true, error: null });

                try {
                    console.log('🔐 Iniciando login...');
                    const data = await loginUser(params);

                    // 📊 Log completo de la data del usuario
                    console.log('✅ Login exitoso');
                    console.log('═══════════════════════════════════════');
                    console.log('📊 DATA COMPLETA DEL USUARIO:');
                    console.log('═══════════════════════════════════════');
                    console.log('🆔 User ID:', data.userId);
                    console.log('📧 Email/Username:', data.userName);
                    console.log('🎭 User Roles:', data.userRoles);
                    console.log('👤 Customer Info:', data.customerInfo);
                    console.log('🔑 Token (primeros 50 chars):', data.token?.substring(0, 50) + '...');
                    console.log('═══════════════════════════════════════');
                    console.table(data); // Muestra toda la data en formato tabla
                    console.log('📋 Raw userRoles:', data.userRoles);

                    // Normalizar roles a array de strings
                    const roles = normalizeRoles(data.userRoles || []);
                    console.log('📋 Roles normalizados:', roles);

                    // Determinar rol del usuario
                    let role: User['role'] = 'operator';

                    const hasAdminRole = roles.some((r) => {
                        const lower = r.toLowerCase();
                        return lower.includes('admin') || lower.includes('super');
                    });

                    const hasAnalystRole = roles.some((r) => {
                        const lower = r.toLowerCase();
                        return lower.includes('analyst') || lower.includes('analista');
                    });

                    if (hasAdminRole) {
                        role = 'admin';
                    } else if (hasAnalystRole) {
                        role = 'analyst';
                    }

                    console.log('👤 Rol asignado:', role);

                    const user: User = {
                        id: data.userId || '',
                        email: data.userName || params.email,
                        name: data.customerInfo?.CustomerName || data.userName || params.email.split('@')[0],
                        role: role,
                        tenantId: String(params.tenantId),
                        permissions: roles,
                        createdAt: new Date().toISOString(),
                    };

                    const tokens: AuthTokens = {
                        accessToken: data.token,
                        refreshToken: '',
                        expiresIn: 86400,
                    };

                    set({
                        user,
                        tokens,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    // 📊 Log del usuario guardado en el store
                    console.log('═══════════════════════════════════════');
                    console.log('💾 USUARIO GUARDADO EN STORE:');
                    console.log('═══════════════════════════════════════');
                    console.table(user);
                    console.log('✅ Sesión iniciada correctamente');

                } catch (error) {
                    console.error('❌ Error en login:', error);

                    const message = error instanceof Error ? error.message : getErrorMessage(error);

                    set({
                        user: null,
                        tokens: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: message,
                    });

                    throw error;
                }
            },

            logout: () => {
                console.log('🚪 Cerrando sesión...');

                Cookies.remove('accessToken', { path: '/' });
                Cookies.remove('refreshToken', { path: '/' });
                Cookies.remove('tenantId', { path: '/' });

                set({
                    user: null,
                    tokens: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
            },

            setUser: (user: User) => {
                set({ user, isAuthenticated: true });
            },

            clearError: () => set({ error: null }),

            hasPermission: (permission: string) => {
                const { user } = get();
                if (!user) return false;
                if (user.role === 'admin') return true;
                return user.permissions?.includes(permission) ?? false;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                tokens: state.tokens,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);