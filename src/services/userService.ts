import { apiClient } from "@/lib/api/client";

// Interface para los parámetros de búsqueda de usuarios
export interface SearchUsersParams {
  Email?: string | null;
  IDNumber?: string | null;
  SearchText?: string | null;
  UserName?: string | null;
  PageNumber: number;
  PageSize: number;
}

// Interface para un usuario en la lista
export interface User {
  UserId: string;
  UserName: string;
  Email: string;
  FirstName: string;
  LastName: string;
  FullName: string;
  IDNumber?: string;
  PhoneNumber?: string;
  Status: string;
  CreatedDate: string;
  Roles?: string[];
  // Campos adicionales que puede traer el API
  Active?: boolean;
  LastLogin?: string;
}

// Interface para la respuesta de búsqueda de usuarios
export interface SearchUsersResponse {
  Status: {
    Code: number;
    Message: string;
  };
  Data: User[] | null;
  TotalCount?: number;
  PageNumber?: number;
  PageSize?: number;
  TotalPages?: number;
}

/**
 * Busca usuarios con paginación y filtros
 * @param params - Parámetros de búsqueda
 * @returns Lista de usuarios paginada
 */
export const searchUsers = async (params: SearchUsersParams = {
  PageNumber: 1,
  PageSize: 10,
  Email: null,
  IDNumber: null,
  SearchText: null,
  UserName: null
}): Promise<SearchUsersResponse> => {
  try {
    const payload = {
      Email: params.Email || null,
      IDNumber: params.IDNumber || null,
      SearchText: params.SearchText || null,
      UserName: params.UserName || null,
      PageNumber: params.PageNumber,
      PageSize: params.PageSize
    };

    console.log("🔍 Buscando usuarios:", payload);

    const response = await apiClient.post<SearchUsersResponse>(
      "/core/user/search",
      payload
    );

    console.log("📦 Respuesta de búsqueda de usuarios:", response.data);

    const statusCode = response.data?.Status?.Code;

    // Si el código es diferente de 200, es un error
    if (statusCode !== 200) {
      const errorMessage = response.data?.Status?.Message || "Error al buscar usuarios";
      console.error("❌ Error del API:", errorMessage);
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Error en searchUsers:", error);

    if (error.response?.data?.Status?.Message) {
      throw new Error(error.response.data.Status.Message);
    }

    throw new Error("Error al buscar usuarios. Por favor intente nuevamente.");
  }
};
