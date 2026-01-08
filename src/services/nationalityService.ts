import { apiClient } from "@/lib/api/client";

const API_MODULE = "mdl03";

export interface Nationality {
  NationalityId: string;
  Description: string;
}

export const getNationalities = async (): Promise<Nationality[]> => {
  try {
    const response = await apiClient.get(
      `/${API_MODULE}/NationalityType/Get/NationalityId?NationalityId=`
    );

    console.log("📦 Respuesta de getNationalities:", response.data);

    let nationalities: Nationality[] = [];

    // Si la respuesta tiene la estructura {Data: [...]}
    if (response.data?.Data) {
      nationalities = response.data.Data;
    }
    // Si la respuesta es directamente un array
    else if (Array.isArray(response.data)) {
      nationalities = response.data;
    }

    // Filtrar duplicados por NationalityId
    const uniqueNationalities = nationalities.reduce((acc: Nationality[], current) => {
      const exists = acc.find(item => item.NationalityId === current.NationalityId);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`✅ ${uniqueNationalities.length} nacionalidades únicas cargadas`);
    return uniqueNationalities;
  } catch (error) {
    console.error("Error fetching nationalities:", error);
    return [];
  }
};
