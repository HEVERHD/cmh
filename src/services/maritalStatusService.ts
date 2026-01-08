import { apiClient } from "@/lib/api/client";

const API_MODULE = "mdl03";

export interface MaritalStatus {
  MaritalStatusId: string;
  Description: string;
}

export const getMaritalStatuses = async (): Promise<MaritalStatus[]> => {
  try {
    const response = await apiClient.get(
      `/${API_MODULE}/MaritalStatusType/Get/MaritalStatusId?MaritalStatusId=`
    );

    console.log("📦 Respuesta de getMaritalStatuses:", response.data);

    let maritalStatuses: MaritalStatus[] = [];

    // Si la respuesta tiene la estructura {Data: [...]}
    if (response.data?.Data) {
      maritalStatuses = response.data.Data;
    }
    // Si la respuesta es directamente un array
    else if (Array.isArray(response.data)) {
      maritalStatuses = response.data;
    }

    // Filtrar duplicados por MaritalStatusId
    const uniqueStatuses = maritalStatuses.reduce((acc: MaritalStatus[], current) => {
      const exists = acc.find(item => item.MaritalStatusId === current.MaritalStatusId);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`✅ ${uniqueStatuses.length} estados civiles únicos cargados`);
    return uniqueStatuses;
  } catch (error) {
    console.error("Error fetching marital statuses:", error);
    return [];
  }
};
