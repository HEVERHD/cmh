// src/types/auth.ts

export type UserRole = 'admin' | 'operator' | 'analyst';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
    avatar?: string;
    permissions: string[];
    createdAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}