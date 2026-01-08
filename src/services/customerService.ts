import { apiClient } from "@/lib/api/client";
import { CUSTOMER_TYPE_IDS } from "./documentTypeService";

// Interfaces para el payload de registro
export interface GeneralTelephone {
  telephoneId: string | null;
  number: string;
  telephoneTypeId: string;
  defaultHome: boolean;
  defaultWork: boolean;
  defaultMobile: boolean;
}

export interface GeneralStore {
  StoreId: string | null;
  AdministrativeLocation: boolean;
  generalTelephone: GeneralTelephone[] | null;
  generalEmail: string | null;
  generalAddress: string | null;
  name: string;
}

export interface GeneralGroup {
  customerGroupId: string;
  Description: string;
}

// Payload base común
interface BaseCustomerPayload {
  tenant: number;
  aludraAPP: boolean;
  customerId: string | null;
  customerTypeId: string;
  customerStatus: string;
  customerStatusId: string;
  dv: string;
  documentTypeId: string;
  generalStore: GeneralStore[];
  generalGroup: GeneralGroup[];
  rolesName: string[];
}

// Payload para cliente empresa
export interface EmpresaCustomerPayload extends BaseCustomerPayload {
  ruc: string;
  legalName: string;
  comercialName: string;
  generalTelephone: GeneralTelephone[]; // Teléfono fuera de generalStore
}

// Payload para cliente particular
export interface ParticularCustomerPayload extends BaseCustomerPayload {
  idNumber?: string; // Para cédula
  ruc?: string; // Para otros documentos (RUC, pasaporte, etc.)
  firstName: string;
  fullName?: string; // Resto del nombre después del primer espacio
  lastName: string;
  gender: string;
  birthDate: string;
  educationalLevel?: string;
  nationality?: string;
  countryId?: string;
  maritalStatus?: string;
  generalTelephone: GeneralTelephone[]; // Teléfono fuera de generalStore
}

export type CustomerPayload = EmpresaCustomerPayload | ParticularCustomerPayload;

// Datos del formulario de cliente particular
export interface ClienteParticularFormData {
  tipoCliente: 'particular';
  nombre: string;
  apellido: string;
  tipoDocumento: string; // ID del tipo de documento
  tipoDocumentoDescripcion?: string; // Descripción para detectar el tipo (cédula, RUC, etc.)
  cedula: string;
  dv?: string;
  genero: string;
  fechaNacimiento: string;
  tipoTelefono: string;
  telefono: string;
  nivelEducacion?: string;
  nacionalidad?: string;
  pais?: string;
  estadoCivil?: string;
}

// Datos del formulario de cliente empresa
export interface ClienteEmpresaFormData {
  tipoCliente: 'empresa';
  nombreLegal: string;
  nombreComercial: string;
  tipoDocumento?: string; // ID del tipo de documento
  tipoDocumentoDescripcion?: string; // Descripción para detectar el tipo
  ruc: string;
  dv: string;
  tipoTelefono: string;
  telefono: string;
  codigoRecurrencia?: string;
  actividadComercial?: string;
  sitioWeb?: string;
  anioFundacion?: string;
  pais?: string;
}

export type ClienteFormData = ClienteParticularFormData | ClienteEmpresaFormData;

// IDs de estado de cliente (activo por defecto)
const CUSTOMER_STATUS = {
  ACTIVE: {
    id: "081e533e-be36-4b79-87a9-d6336eab5aaf",
    name: "active"
  }
};

// Grupo por defecto (Construcción)
const DEFAULT_CUSTOMER_GROUP = {
  customerGroupId: "6FB96B9F-C162-4007-8192-6645FC874A47",
  Description: "Construcción"
};

// Función helper para obtener el tenant del localStorage
const getTenant = (): number => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.state?.company?.tenantId || 2;
      }
    } catch (e) {
      console.error("Error obteniendo tenant:", e);
    }
  }
  return 2; // Default tenant
};

// Función para transformar datos del formulario a payload de API para EMPRESA
const buildEmpresaPayload = (data: ClienteEmpresaFormData): EmpresaCustomerPayload => {
  const tenant = getTenant();

  // Construir generalTelephone array (fuera de generalStore)
  const generalTelephone: GeneralTelephone[] = data.telefono ? [
    {
      telephoneId: null,
      number: data.telefono,
      telephoneTypeId: data.tipoTelefono,
      defaultHome: true,
      defaultWork: false,
      defaultMobile: false
    }
  ] : [];

  return {
    tenant,
    aludraAPP: true,
    customerId: null,
    customerTypeId: CUSTOMER_TYPE_IDS.EMPRESA,
    customerStatus: CUSTOMER_STATUS.ACTIVE.name,
    customerStatusId: CUSTOMER_STATUS.ACTIVE.id,
    ruc: data.ruc,
    dv: data.dv,
    documentTypeId: data.tipoDocumento || "4D582F7F-C981-4ED4-9364-708452802303", // RUC por defecto
    legalName: data.nombreLegal,
    comercialName: data.nombreComercial,
    // generalTelephone fuera de generalStore
    generalTelephone,
    generalStore: [
      {
        StoreId: null,
        AdministrativeLocation: true,
        generalTelephone: null, // Ya no va aquí
        generalEmail: null,
        generalAddress: null,
        name: data.nombreLegal
      }
    ],
    generalGroup: [DEFAULT_CUSTOMER_GROUP],
    rolesName: ["CUSTOMER"]
  };
};

// Helper para detectar si es cédula
const isCedulaDocumentType = (tipoDocumento: string): boolean => {
  const tipoLower = tipoDocumento.toLowerCase();
  return tipoLower.includes('cédula') || tipoLower.includes('cedula') ||
         tipoLower.includes('identificación') || tipoLower.includes('identificacion') ||
         tipoLower.includes('documento de ident');
};

// Helper para detectar si es RUC
const isRucDocumentType = (tipoDocumento: string): boolean => {
  const tipoLower = tipoDocumento.toLowerCase();
  return tipoLower.includes('ruc');
};

// Función para obtener el campo correcto del documento según el tipo
const getDocumentField = (tipoDocumento: string, valor: string): { idNumber?: string; ruc?: string } => {
  if (isCedulaDocumentType(tipoDocumento)) {
    return { idNumber: valor };
  }
  if (isRucDocumentType(tipoDocumento)) {
    return { ruc: valor };
  }
  // Para otros tipos (pasaporte, NT, etc.) usar ruc por defecto
  return { ruc: valor };
};

// Función para transformar datos del formulario a payload de API para PARTICULAR
const buildParticularPayload = (data: ClienteParticularFormData): ParticularCustomerPayload => {
  const tenant = getTenant();

  // Separar nombre: firstName = primera palabra, fullName = resto
  const nombreParts = data.nombre.trim().split(/\s+/);
  const firstName = nombreParts[0] || '';
  const fullName = nombreParts.slice(1).join(' ') || undefined; // undefined si no hay más partes

  // Obtener el campo correcto para el documento (idNumber o ruc)
  // Usar la descripción del tipo de documento para detectar, no el ID
  const tipoDocDescripcion = data.tipoDocumentoDescripcion || data.tipoDocumento;
  const documentField = getDocumentField(tipoDocDescripcion, data.cedula);

  // Construir generalTelephone array
  const generalTelephone: GeneralTelephone[] = data.telefono ? [
    {
      telephoneId: null,
      number: data.telefono,
      telephoneTypeId: data.tipoTelefono,
      defaultHome: true,
      defaultWork: false,
      defaultMobile: false
    }
  ] : [];

  return {
    tenant,
    aludraAPP: true,
    customerId: null,
    customerTypeId: CUSTOMER_TYPE_IDS.PARTICULAR,
    customerStatus: CUSTOMER_STATUS.ACTIVE.name,
    customerStatusId: CUSTOMER_STATUS.ACTIVE.id,
    // Campo dinámico según tipo de documento: idNumber para cédula, ruc para RUC/otros
    ...documentField,
    dv: data.dv || "",
    documentTypeId: data.tipoDocumento,
    firstName,
    fullName,
    lastName: data.apellido,
    gender: data.genero,
    birthDate: data.fechaNacimiento,
    educationalLevel: data.nivelEducacion,
    nationality: data.nacionalidad,
    countryId: data.pais,
    maritalStatus: data.estadoCivil,
    // generalTelephone va fuera de generalStore
    generalTelephone,
    generalStore: [
      {
        StoreId: null,
        AdministrativeLocation: true,
        generalTelephone: null, // Ya no va aquí
        generalEmail: null,
        generalAddress: null,
        name: `${data.nombre} ${data.apellido}`
      }
    ],
    generalGroup: [DEFAULT_CUSTOMER_GROUP],
    rolesName: ["CUSTOMER"]
  };
};

// Respuesta del API
export interface RegisterCustomerResponse {
  Status: {
    Code: number;
    Message: string;
  };
  Data: {
    CustomerId: string;
    CustomerCode: string;
  } | null;
}

/**
 * Registra un nuevo cliente (particular o empresa)
 * @param formData - Datos del formulario de cliente
 * @returns Respuesta del API con el ID del cliente creado
 */
export const registerCustomer = async (formData: ClienteFormData): Promise<RegisterCustomerResponse> => {
  try {
    let payload: CustomerPayload;

    if (formData.tipoCliente === 'empresa') {
      payload = buildEmpresaPayload(formData);
    } else {
      payload = buildParticularPayload(formData);
    }

    console.log("📤 Enviando registro de cliente:", payload);

    const response = await apiClient.post<RegisterCustomerResponse>(
      "/core/register/v2",
      payload
    );

    console.log("📦 Respuesta de registro:", response.data);

    const statusCode = response.data?.Status?.Code;

    // Si el código es diferente de 200, es un error
    if (statusCode !== 200) {
      const errorMessage = response.data?.Status?.Message || "Error al registrar cliente";
      console.error("❌ Error del API:", errorMessage);
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Error en registerCustomer:", error);

    // Si ya es un Error con mensaje, re-lanzarlo
    if (error instanceof Error && error.message) {
      throw error;
    }

    // Manejar errores de respuesta HTTP del API
    if (error.response?.data?.Status?.Message) {
      throw new Error(error.response.data.Status.Message);
    }

    // Error genérico de red u otro
    throw new Error("Error de conexión. Por favor intente nuevamente.");
  }
};
