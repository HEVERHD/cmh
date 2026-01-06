// src/lib/api/client.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://qa-apim.aludra.cloud';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'f718d6d8af9848008b8f6a6f516cb7ba';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': API_KEY,
    },
    timeout: 15000,
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('tenantId');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ============ API Functions ============

// Verificar compañía
export const checkCompany = async (companyName: string): Promise<any> => {
    const { data } = await apiClient.get(`/core/CheckCompany/companyname/${companyName}`);

    console.log('📦 Respuesta de CheckCompany:', data);

    const statusCode = data?.Status?.Code;
    if (statusCode === 404 || statusCode === 400) {
        throw new Error(data?.Status?.Message || 'Compañía no encontrada');
    }

    if (!data?.Data || (Array.isArray(data.Data) && data.Data.length === 0) || data?.Data === null) {
        throw new Error('Compañía no encontrada');
    }

    console.log('✅ Compañía encontrada:', data.Data);
    return data.Data;
};

// Login
export interface LoginParams {
    email: string;
    password: string;
    tenantId: number;
    rememberMe?: boolean;
}

export const loginUser = async (params: LoginParams): Promise<any> => {
    const { data } = await apiClient.post('/core/Login', {
        Email: params.email,
        userName: null,
        Password: params.password,
        RememberMe: params.rememberMe ?? true,
        Tenant: params.tenantId,
    });

    console.log('🔐 Respuesta de Login:', data);

    // Verificar Status.Code de error
    const statusCode = data?.Status?.Code;
    if (statusCode === 401 || statusCode === 404 || statusCode === 400) {
        throw new Error(data?.Status?.Message || 'Credenciales inválidas');
    }

    // Verificar que Data exista
    if (!data?.Data) {
        throw new Error(data?.Status?.Message || 'Credenciales inválidas');
    }

    const responseData = data.Data;

    // Verificar IdentityInfo.Succeeded
    if (responseData?.IdentityInfo?.Succeeded === false) {
        throw new Error(responseData?.CustomerInfo?.LoginMessage || 'Credenciales inválidas');
    }

    // ✅ El token está en AuthenticationInfo.Token
    const token = responseData?.AuthenticationInfo?.Token;

    if (!token) {
        throw new Error('Error de autenticación - No se recibió token');
    }

    console.log('✅ Login exitoso');

    // Retornar estructura normalizada
    return {
        token: token,
        userId: responseData?.AuthenticationInfo?.UserId,
        userName: responseData?.AuthenticationInfo?.UserName,
        userRoles: responseData?.AuthenticationInfo?.UserRoles || [],
        customerInfo: responseData?.CustomerInfo,
    };
};

// Helper para mensajes de error
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data?.Status?.Message) return data.Status.Message;
        if (typeof data === 'string') return data;
        if (data?.message) return data.message;
        if (data?.Message) return data.Message;
        if (error.response?.status === 404) return 'No encontrado';
        if (error.response?.status === 401) return 'Credenciales inválidas';
        return error.message || 'Error de conexión';
    }
    if (error instanceof Error) return error.message;
    return 'Error desconocido';
};

export default apiClient;