import { apiClient } from "@/lib/api/client";

const API_MODULE = "mdl03";

export interface TelephoneType {
  TelephoneTypeId: string;
  Description: string;
  Code?: string;
}

// Regex para validación de teléfono panameño
export const TELEPHONE_REGEX = /^[2-5789][0-9]{6}$/;
export const CELLPHONE_REGEX = /^6[0-9]{7}$/;

export const getTelephoneTypes = async (): Promise<TelephoneType[]> => {
  try {
    const response = await apiClient.get(`/${API_MODULE}/telephoneType`);

    console.log("📦 Respuesta de getTelephoneTypes:", response.data);

    let telephoneTypes: TelephoneType[] = [];

    // Si la respuesta tiene la estructura {Data: [...]}
    if (response.data?.Data) {
      telephoneTypes = response.data.Data;
    }
    // Si la respuesta es directamente un array
    else if (Array.isArray(response.data)) {
      telephoneTypes = response.data;
    }

    // Filtrar duplicados por TelephoneTypeId
    const uniqueTelephoneTypes = telephoneTypes.reduce((acc: TelephoneType[], current) => {
      const exists = acc.find(item => item.TelephoneTypeId === current.TelephoneTypeId);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`✅ ${uniqueTelephoneTypes.length} tipos de teléfono únicos cargados`);
    return uniqueTelephoneTypes;
  } catch (error) {
    console.error("Error fetching telephone types:", error);
    return [];
  }
};
