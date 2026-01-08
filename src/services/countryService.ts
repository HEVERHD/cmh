import { apiClient } from "@/lib/api/client";

const API_MODULE = "mdl03";

export interface Country {
  CountryId: string;
  Name: string;
  Code: string;
  PhoneCode: string;
}

export const getCountries = async (): Promise<Country[]> => {
  try {
    const response = await apiClient.get(
      `/${API_MODULE}/AddressCountry/Get/CountryId?`
    );

    console.log("📦 Respuesta de getCountries:", response.data);

    let countries: Country[] = [];

    // Si la respuesta tiene la estructura {Data: [...]}
    if (response.data?.Data) {
      countries = response.data.Data;
    }
    // Si la respuesta es directamente un array
    else if (Array.isArray(response.data)) {
      countries = response.data;
    }

    // Filtrar duplicados por CountryId
    const uniqueCountries = countries.reduce((acc: Country[], current) => {
      const exists = acc.find(item => item.CountryId === current.CountryId);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`✅ ${uniqueCountries.length} países únicos cargados`);
    return uniqueCountries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};
