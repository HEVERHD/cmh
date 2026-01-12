// src/lib/api/client.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://qa-apim.aludra.cloud";
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY || "f718d6d8af9848008b8f6a6f516cb7ba";
const MDL05_API_KEY = process.env.NEXT_PUBLIC_MDL05_API_KEY || "";
const SUBSCRIPTION_KEY = process.env.NEXT_PUBLIC_SUBSCRIPTION_KEY || "";

// Helper para obtener token
const getAccessToken = (): string | undefined => {
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.tokens?.accessToken;
        if (token) return token;
      }
    } catch (e) {}
  }
  return Cookies.get("accessToken");
};

// Cliente principal (MDL03, Core, etc.)
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "api-key": API_KEY,
    "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
  },
  timeout: 30000, // 30 segundos
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
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
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth-storage");
      }
      Cookies.remove("accessToken");
      Cookies.remove("tenantId");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// =====================================================
// Cliente para MDL05 (Clubes) - TIMEOUT LARGO
// El endpoint /club/history tarda ~1-2 minutos
// =====================================================
export const mdl05Client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "api-key": API_KEY,
  },
  timeout: 180000, // 3 MINUTOS - el endpoint es MUY lento
});

mdl05Client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.error("MDL05 Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// ============ API Functions ============

export const checkCompany = async (companyName: string): Promise<any> => {
  const { data } = await apiClient.get(
    `/core/CheckCompany/companyname/${companyName}`
  );
  const statusCode = data?.Status?.Code;
  if (statusCode === 404 || statusCode === 400) {
    throw new Error(data?.Status?.Message || "Compañía no encontrada");
  }
  if (!data?.Data || (Array.isArray(data.Data) && data.Data.length === 0)) {
    throw new Error("Compañía no encontrada");
  }
  return data.Data;
};

export interface LoginParams {
  email: string;
  password: string;
  tenantId: number;
  rememberMe?: boolean;
}

export const loginUser = async (params: LoginParams): Promise<any> => {
  const { data } = await apiClient.post("/core/Login", {
    Email: params.email,
    userName: null,
    Password: params.password,
    RememberMe: params.rememberMe ?? true,
    Tenant: params.tenantId,
  });

  const statusCode = data?.Status?.Code;
  if (statusCode === 401 || statusCode === 404 || statusCode === 400) {
    throw new Error(data?.Status?.Message || "Credenciales inválidas");
  }

  if (!data?.Data) {
    throw new Error(data?.Status?.Message || "Credenciales inválidas");
  }

  const responseData = data.Data;

  if (responseData?.IdentityInfo?.Succeeded === false) {
    throw new Error(
      responseData?.CustomerInfo?.LoginMessage || "Credenciales inválidas"
    );
  }

  const token = responseData?.AuthenticationInfo?.Token;

  if (!token) {
    throw new Error("Error de autenticación - No se recibió token");
  }

  Cookies.set("tenantId", String(params.tenantId), { expires: 7, path: "/" });

  return {
    token: token,
    userId: responseData?.AuthenticationInfo?.UserId,
    userName: responseData?.AuthenticationInfo?.UserName,
    userRoles: responseData?.AuthenticationInfo?.UserRoles || [],
    customerInfo: responseData?.CustomerInfo,
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.Status?.Message) return data.Status.Message;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.Message) return data.Message;
    if (error.code === "ECONNABORTED") return "Tiempo de espera agotado";
    if (error.response?.status === 404) return "No encontrado";
    if (error.response?.status === 401) return "Credenciales inválidas";
    return error.message || "Error de conexión";
  }
  if (error instanceof Error) return error.message;
  return "Error desconocido";
};

export default apiClient;
