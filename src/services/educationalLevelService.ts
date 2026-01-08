import { apiClient } from "@/lib/api/client";

const API_MODULE = "mdl03";

export interface EducationalLevel {
  EducationalLevelId: string;
  Description: string;
}

export const getEducationalLevels = async (): Promise<EducationalLevel[]> => {
  try {
    const response = await apiClient.get(
      `/${API_MODULE}/EducationalLevelType/Get/EducationalLevelId?educationalLevelId=`
    );

    console.log("📦 Respuesta de getEducationalLevels:", response.data);

    let levels: EducationalLevel[] = [];

    // Si la respuesta tiene la estructura {Data: [...]}
    if (response.data?.Data) {
      levels = response.data.Data;
    }
    // Si la respuesta es directamente un array
    else if (Array.isArray(response.data)) {
      levels = response.data;
    }

    // Filtrar duplicados por EducationalLevelId
    const uniqueLevels = levels.reduce((acc: EducationalLevel[], current) => {
      const exists = acc.find(
        (item) => item.EducationalLevelId === current.EducationalLevelId
      );
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`✅ ${uniqueLevels.length} niveles educativos únicos cargados`);
    return uniqueLevels;
  } catch (error) {
    console.error("Error fetching educational levels:", error);
    return [];
  }
};
