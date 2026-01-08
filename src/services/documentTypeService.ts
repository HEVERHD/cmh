import { apiClient } from "@/lib/api/client";

const API_MODULE = "mdl03";

export interface DocumentType {
  DocumentTypeId: string;
  Description: string;
  Code: string;
}

export const CUSTOMER_TYPE_IDS = {
  PARTICULAR: '41acbcf4-be83-4f03-8b5e-5760fc92b59b',
  EMPRESA: '52acbcf4-be83-4f03-8b5e-5760fc92b59b'
};

export const getDocumentTypes = async (customerTypeId: string): Promise<DocumentType[]> => {
  try {
    const response = await apiClient.get(
      `/${API_MODULE}/documentType?customerTypeId=${customerTypeId}`
    );

    console.log("📦 Respuesta de getDocumentTypes:", response.data);

    let documentTypes: DocumentType[] = [];

    // Si la respuesta tiene la estructura {Data: [...]}
    if (response.data?.Data) {
      documentTypes = response.data.Data;
    }
    // Si la respuesta es directamente un array
    else if (Array.isArray(response.data)) {
      documentTypes = response.data;
    }

    // Filtrar duplicados por DocumentTypeId
    const uniqueDocumentTypes = documentTypes.reduce((acc: DocumentType[], current) => {
      const exists = acc.find(item => item.DocumentTypeId === current.DocumentTypeId);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`✅ ${uniqueDocumentTypes.length} tipos de documento únicos cargados`);
    return uniqueDocumentTypes;
  } catch (error) {
    console.error("Error fetching document types:", error);
    return [];
  }
};
