import { apiClient } from "@/lib/api/client";

const API_MODULE = "mdl03";

export interface Gender {
  GenderId: string;
  Description: string;
}

export const getGenders = async (): Promise<Gender[]> => {
  try {
    const response = await apiClient.get(
      `/${API_MODULE}/GenderType/Get/GenderId?GenderId=`
    );

    console.log("📦 Respuesta de getGenders:", response.data);

    let genders: Gender[] = [];

    // Si la respuesta tiene la estructura {Data: [...]}
    if (response.data?.Data) {
      genders = response.data.Data;
    }
    // Si la respuesta es directamente un array
    else if (Array.isArray(response.data)) {
      genders = response.data;
    }

    // Filtrar duplicados por GenderId
    const uniqueGenders = genders.reduce((acc: Gender[], current) => {
      const exists = acc.find(
        (item) => item.GenderId === current.GenderId
      );
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`✅ ${uniqueGenders.length} géneros únicos cargados`);
    return uniqueGenders;
  } catch (error) {
    console.error("Error fetching genders:", error);
    return [];
  }
};
