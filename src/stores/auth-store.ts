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
                    // loginUser ya valida y retorna estructura normalizada
                    const data = await loginUser(params);

                    // Guardar token en cookies
                    Cookies.set('accessToken', data.token, {
                        expires: params.rememberMe ? 7 : 1,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax'
                    });

                    Cookies.set('tenantId', String(params.tenantId));

                    // Determinar rol basado en userRoles
                    let role: User['role'] = 'operator';
                    if (data.userRoles?.includes('Admin') || data.userRoles?.includes('admin')) {
                        role = 'admin';
                    } else if (data.userRoles?.includes('Analyst') || data.userRoles?.includes('analyst')) {
                        role = 'analyst';
                    }

                    const user: User = {
                        id: data.userId || '',
                        email: data.userName || params.email,
                        name: data.customerInfo?.CustomerName || data.userName || params.email.split('@')[0],
                        role: role,
                        tenantId: String(params.tenantId),
                        permissions: data.userRoles || [],
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

                } catch (error) {
                    Cookies.remove('accessToken');
                    Cookies.remove('tenantId');

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
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                Cookies.remove('tenantId');

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
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);