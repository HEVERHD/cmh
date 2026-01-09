'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import CountrySelector from './CountrySelector';
import EducationalLevelSelector from './EducationalLevelSelector';
import GenderSelector from './GenderSelector';
import MaritalStatusSelector from './MaritalStatusSelector';
import NationalitySelector from './NationalitySelector';
import DocumentTypeSelector, { DocumentTypeSelection } from './DocumentTypeSelector';
import TelephoneTypeSelector, { TelephoneTypeSelection } from './TelephoneTypeSelector';
import { CUSTOMER_TYPE_IDS } from '@/services/documentTypeService';
import { TELEPHONE_REGEX, CELLPHONE_REGEX } from '@/services/telephoneTypeService';

// Regex para validación de documentos
const DOCUMENT_REGEX = {
    // Cédula completa: formato final válido (PE|E|N|2-13 con AV/PI opcional)-####-######
    cedula: /^(PE|E|N|[23456789](?:AV|PI)?|1[0123]?(?:AV|PI)?)-(\d{1,4})-(\d{1,6})$/i,
    // Cédula parcial: permite entrada progresiva mientras el usuario escribe
    cedulaPartial: /^P$|^(?:PE|E|N|[23456789]|[23456789](?:A|P)?|1[0123]?|1[0123]?(?:A|P)?)$|^(?:PE|E|N|[23456789]|[23456789](?:AV|PI)?|1[0123]?|1[0123]?(?:AV|PI)?)-?$|^(?:PE|E|N|[23456789](?:AV|PI)?|1[0123]?(?:AV|PI)?)-(?:\d{1,4})-?$|^(PE|E|N|[23456789](?:AV|PI)?|1[0123]?(?:AV|PI)?)-(\d{1,4})-(\d{1,6})$/i,
    pasaporte: /^[a-zA-Z0-9]+$/,
    ruc: /^\d+-\d+-\d+$/,
    nt: /^(1[0-3]|0?[1-9])-NT-\d{1}-\d{1,8}$/
};

// Helper para detectar si es tipo NT (Número Tributario)
const isNTDocument = (tipoDocumento: string): boolean => {
    const tipoLower = tipoDocumento.toLowerCase();
    // Detectar NT como palabra completa usando regex con word boundary
    // Esto evita detectar "nt" dentro de "identificación" o "documento"
    // También detectar "número tributario" o "numero tributario"
    return /\bnt\b/.test(tipoLower) ||
           tipoLower.includes('contribuyente') ||
           tipoLower.includes('tributario');
};

// Helper para detectar si es cédula/documento de identificación
const isCedulaDocument = (tipoDocumento: string): boolean => {
    const tipoLower = tipoDocumento.toLowerCase();
    return tipoLower.includes('cédula') || tipoLower.includes('cedula') ||
           tipoLower.includes('identificación') || tipoLower.includes('identificacion') ||
           tipoLower.includes('documento de ident');
};

// Función para obtener el regex según el tipo de documento
const getDocumentRegex = (tipoDocumento: string, tipoCliente?: 'particular' | 'empresa' | null): { regex: RegExp; partial: RegExp; message: string } => {
    const tipoLower = tipoDocumento.toLowerCase();

    if (tipoLower.includes('ruc')) {
        return {
            regex: DOCUMENT_REGEX.ruc,
            partial: /^[\d-]*$/,
            message: 'Formato inválido. Ej: 123-456-789'
        };
    }
    if (tipoLower.includes('pasaporte')) {
        return {
            regex: DOCUMENT_REGEX.pasaporte,
            partial: DOCUMENT_REGEX.pasaporte,
            message: 'Solo se permiten letras y números'
        };
    }
    // Cédula o documento de identificación (antes de NT para evitar falsos positivos)
    if (isCedulaDocument(tipoDocumento)) {
        return {
            regex: DOCUMENT_REGEX.cedulaPartial,
            partial: DOCUMENT_REGEX.cedulaPartial,
            message: 'Formato inválido. Ej: 8-123-4567'
        };
    }
    // NT: detectar usando word boundary para evitar falsos positivos
    if (isNTDocument(tipoDocumento)) {
        return {
            regex: DOCUMENT_REGEX.nt,
            partial: /^[\d-NT]*$/i,
            message: 'Formato inválido. Ej: 9-NT-1-12345678'
        };
    }
    // Por defecto: RUC para empresa, cédula para particular
    if (tipoCliente === 'empresa') {
        return {
            regex: DOCUMENT_REGEX.ruc,
            partial: /^[\d-]*$/,
            message: 'Formato inválido. Ej: 123-456-789'
        };
    }
    // Para cédula/documento de identificación: usar regex que permite entrada progresiva
    return {
        regex: DOCUMENT_REGEX.cedulaPartial, // Usar cedulaPartial para validar tanto parciales como completos
        partial: DOCUMENT_REGEX.cedulaPartial,
        message: 'Formato inválido. Ej: 8-123-4567'
    };
};

// Esquema para cliente particular
const clienteParticularSchema = z.object({
    tipoCliente: z.literal('particular'),
    nombre: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    apellido: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    tipoDocumento: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    cedula: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    dv: z.string().optional(),
    genero: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    fechaNacimiento: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    tipoTelefono: z.string().min(1, 'Campo requerido'),
    telefono: z.string().min(1, 'Campo requerido'),
    nivelEducacion: z.string().optional(),
    nacionalidad: z.string().optional(),
    pais: z.string().optional(),
    estadoCivil: z.string().optional()
});

// Esquema para cliente empresa
const clienteEmpresaSchema = z.object({
    tipoCliente: z.literal('empresa'),
    nombreLegal: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    nombreComercial: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    tipoDocumento: z.string().optional(),
    ruc: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    dv: z.string({ required_error: 'Campo requerido', invalid_type_error: 'Campo requerido' }).min(1, 'Campo requerido'),
    tipoTelefono: z.string().min(1, 'Campo requerido'),
    telefono: z.string().min(1, 'Campo requerido'),
    codigoRecurrencia: z.string().optional(),
    actividadComercial: z.string().optional(),
    sitioWeb: z.string().optional().or(z.literal('')),
    anioFundacion: z.string().optional(),
    pais: z.string().optional()
});

type ClienteParticularFormData = z.infer<typeof clienteParticularSchema>;
type ClienteEmpresaFormData = z.infer<typeof clienteEmpresaSchema>;
type ClienteFormData = ClienteParticularFormData | ClienteEmpresaFormData;

interface ClienteRegistroFormProps {
    onSubmit: (data: ClienteFormData) => void;
    onCancel: () => void;
}

export default function ClienteRegistroForm({ onSubmit, onCancel }: ClienteRegistroFormProps) {
    const [tipoCliente, setTipoCliente] = useState<'particular' | 'empresa' | null>(null);

    // Forms separados para cada tipo
    const formParticular = useForm<ClienteParticularFormData>({
        resolver: zodResolver(clienteParticularSchema),
        defaultValues: {
            tipoCliente: 'particular',
            nombre: '',
            apellido: '',
            tipoDocumento: '',
            cedula: '',
            dv: '',
            genero: '',
            fechaNacimiento: '',
            tipoTelefono: '',
            telefono: '',
            nivelEducacion: '',
            nacionalidad: '',
            pais: '',
            estadoCivil: ''
        }
    });

    const formEmpresa = useForm<ClienteEmpresaFormData>({
        resolver: zodResolver(clienteEmpresaSchema),
        defaultValues: {
            tipoCliente: 'empresa',
            nombreLegal: '',
            nombreComercial: '',
            tipoDocumento: '',
            ruc: '',
            dv: '',
            tipoTelefono: '',
            telefono: '',
            codigoRecurrencia: '',
            actividadComercial: '',
            sitioWeb: '',
            anioFundacion: '',
            pais: ''
        }
    });

    const currentForm = tipoCliente === 'particular' ? formParticular : formEmpresa;
    const { handleSubmit, control, register, formState: { errors }, setFocus, watch } = currentForm;

    // Observar el tipo de documento seleccionado
    const tipoDocumentoSeleccionado: string = (watch as any)('tipoDocumento') || '';

    // Estado para error de validación del documento
    const [documentError, setDocumentError] = useState<string>('');

    // Estado para guardar la descripción del tipo de documento (para validación de regex)
    const [documentTypeDescription, setDocumentTypeDescription] = useState<string>('');

    // Estado para error de validación del teléfono
    const [phoneError, setPhoneError] = useState<string>('');

    // Estado para guardar la descripción del tipo de teléfono (para validación de regex)
    const [telephoneTypeDescription, setTelephoneTypeDescription] = useState<string>('');

    // Función para validar el teléfono según el tipo
    const validatePhone = (value: string, tipoTelefono: string): { isValid: boolean; message: string; maxLength: number } => {
        const tipoLower = tipoTelefono.toLowerCase();
        const isCellphone = tipoLower.includes('celular') || tipoLower.includes('móvil') || tipoLower.includes('movil') || tipoLower.includes('cell');

        if (isCellphone) {
            return {
                isValid: CELLPHONE_REGEX.test(value),
                message: 'Formato inválido. Debe iniciar con 6 y tener 8 dígitos',
                maxLength: 8
            };
        }
        return {
            isValid: TELEPHONE_REGEX.test(value),
            message: 'Formato inválido. Debe iniciar con 2-5, 7, 8 o 9 y tener 7 dígitos',
            maxLength: 7
        };
    };

    // Obtener placeholder y maxLength según el tipo de teléfono
    const getPhoneConfig = (tipoTelefono: string): { placeholder: string; maxLength: number } => {
        const tipoLower = tipoTelefono.toLowerCase();
        const isCellphone = tipoLower.includes('celular') || tipoLower.includes('móvil') || tipoLower.includes('movil') || tipoLower.includes('cell');

        if (isCellphone) {
            return { placeholder: 'Ej: 61234567', maxLength: 8 };
        }
        return { placeholder: 'Ej: 2123456', maxLength: 7 };
    };

    // Función para obtener el label del campo de documento según el tipo seleccionado
    const getDocumentFieldLabel = (tipoDocumento: string): string => {
        if (!tipoDocumento) return tipoCliente === 'empresa' ? 'RUC' : 'Cédula';

        const tipoLower = tipoDocumento.toLowerCase();

        if (tipoLower.includes('ruc')) return 'RUC';
        if (isCedulaDocument(tipoDocumento)) return 'Cédula';
        if (tipoLower.includes('pasaporte')) return 'Pasaporte';
        if (tipoLower.includes('carnet') || tipoLower.includes('extranjería') || tipoLower.includes('extranjeria')) return 'Carnet de Extranjería';
        if (isNTDocument(tipoDocumento)) return 'NT';

        // Si no coincide con ninguno conocido, usar la descripción del tipo de documento
        return tipoDocumento;
    };

    // Función para validar el documento según el tipo
    const validateDocument = (value: string, tipoDocumento: string): boolean => {
        if (!value) return true; // Si está vacío, la validación de requerido se encarga
        const { regex } = getDocumentRegex(tipoDocumento, tipoCliente);
        return regex.test(value);
    };

    // Función para obtener el placeholder según el tipo de documento
    const getDocumentPlaceholder = (tipoDocumento: string): string => {
        const tipoLower = tipoDocumento.toLowerCase();

        if (tipoLower.includes('ruc')) return 'Ej: 123-456-789';
        if (tipoLower.includes('pasaporte')) return 'Ej: AB1234567';
        // Cédula o documento de identificación (antes de NT para evitar falsos positivos)
        if (isCedulaDocument(tipoDocumento)) return 'Ej: 8-123-4567';
        // NT: usar helper con word boundary
        if (isNTDocument(tipoDocumento)) return 'Ej: 9-NT-1-12345678';
        // Por defecto: RUC para empresa, cédula para particular
        if (tipoCliente === 'empresa') return 'Ej: 123-456-789';
        return 'Ej: 8-123-4567';
    };

    // Limpiar error de documento cuando cambia el tipo de documento
    useEffect(() => {
        setDocumentError('');
    }, [tipoDocumentoSeleccionado]);

    // Efecto para hacer focus en el primer campo con error
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            setFocus(firstErrorField as any);
        }
    }, [errors, setFocus]);

    const handleTipoClienteSelect = (tipo: 'particular' | 'empresa') => {
        setTipoCliente(tipo);
        setDocumentTypeDescription('');
        setDocumentError('');
        setPhoneError('');
        setTelephoneTypeDescription('');
        if (tipo === 'particular') {
            formParticular.reset({ tipoCliente: 'particular' });
        } else {
            formEmpresa.reset({ tipoCliente: 'empresa' });
        }
    };

    const onSubmitForm = (data: ClienteFormData) => {
        // Validar el documento antes de enviar
        const tipoDoc = documentTypeDescription || (data as any).tipoDocumento || '';
        const documentValue = tipoCliente === 'particular' ? (data as any).cedula : (data as any).ruc;

        if (documentValue && !validateDocument(documentValue, tipoDoc)) {
            const { message } = getDocumentRegex(tipoDoc, tipoCliente);
            setDocumentError(message);
            return; // No enviar si hay error de validación de documento
        }

        // Validar el teléfono antes de enviar
        const phoneValue = (data as any).telefono;
        if (phoneValue && telephoneTypeDescription) {
            const validation = validatePhone(phoneValue, telephoneTypeDescription);
            if (!validation.isValid) {
                setPhoneError(validation.message);
                return; // No enviar si hay error de validación de teléfono
            }
        }

        // Agregar la descripción del tipo de documento para la detección en el servicio
        const dataWithDescriptions = {
            ...data,
            tipoDocumentoDescripcion: documentTypeDescription
        };
        // Solo enviar los datos, no resetear el form aquí
        // El reset se hará desde el padre cuando el registro sea exitoso
        onSubmit(dataWithDescriptions);
    };

    const handleCancel = () => {
        if (tipoCliente === 'particular') {
            formParticular.reset();
        } else {
            formEmpresa.reset();
        }
        setTipoCliente(null);
        setDocumentTypeDescription('');
        setDocumentError('');
        setPhoneError('');
        setTelephoneTypeDescription('');
        onCancel();
    };

    if (!tipoCliente) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Nuevo Cliente</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Seleccione el tipo de cliente que desea registrar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleTipoClienteSelect('particular')}
                        className="p-6 border-2 rounded-lg transition-all group"
                        style={{ borderColor: 'var(--border)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--primary-light)' }}>
                                <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cliente Particular</h3>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Persona natural</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleTipoClienteSelect('empresa')}
                        className="p-6 border-2 rounded-lg transition-all group"
                        style={{ borderColor: 'var(--border)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--primary-light)' }}>
                                <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cliente Empresa</h3>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Persona jurídica</p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmitForm as any)} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {tipoCliente === 'particular' ? 'Registro Cliente Particular' : 'Registro Cliente Empresa'}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Complete todos los campos requeridos</p>
                </div>
                <button
                    type="button"
                    onClick={() => setTipoCliente(null)}
                    className="text-sm transition-colors"
                    style={{ color: 'var(--primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-glow)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
                >
                    Cambiar tipo
                </button>
            </div>

            <input type="hidden" {...register('tipoCliente' as any)} value={tipoCliente} />

            {tipoCliente === 'particular' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('nombre' as any)}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: (errors as any).nombre ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = (errors as any).nombre ? '1px solid var(--error)' : '1px solid var(--border)'}
                            placeholder="Ingrese el nombre"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                            }}
                        />
                        {(errors as any).nombre && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).nombre.message}</p>
                        )}
                    </div>

                    {/* Apellido */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Apellido <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('apellido' as any)}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: (errors as any).apellido ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = (errors as any).apellido ? '1px solid var(--error)' : '1px solid var(--border)'}
                            placeholder="Ingrese el apellido"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                            }}
                        />
                        {(errors as any).apellido && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).apellido.message}</p>
                        )}
                    </div>

                    {/* Tipo de Documento */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Tipo de Documento <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="tipoDocumento" as any
                            control={control}
                            render={({ field }) => (
                                <DocumentTypeSelector
                                    value={field.value || ''}
                                    onChange={(selection: DocumentTypeSelection) => {
                                        // Guardar el ID en el form (para enviar al API)
                                        field.onChange(selection.documentTypeId);
                                        // Guardar la descripción para validación de regex
                                        setDocumentTypeDescription(selection.description);
                                    }}
                                    customerTypeId={CUSTOMER_TYPE_IDS.PARTICULAR}
                                    error={(errors as any).tipoDocumento?.message}
                                    required
                                />
                            )}
                        />
                    </div>

                    {/* Cédula / Documento */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {getDocumentFieldLabel(documentTypeDescription || tipoDocumentoSeleccionado)} <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('cedula' as any, {
                                onChange: () => {
                                    if (documentError) {
                                        setDocumentError('');
                                    }
                                }
                            })}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: ((errors as any).cedula || documentError) ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => {
                                const value = e.target.value;
                                const tipoDoc = documentTypeDescription || tipoDocumentoSeleccionado;
                                if (value && !validateDocument(value, tipoDoc)) {
                                    setDocumentError(getDocumentRegex(tipoDoc, tipoCliente).message);
                                } else {
                                    setDocumentError('');
                                }
                                e.currentTarget.style.border = ((errors as any).cedula || documentError) ? '1px solid var(--error)' : '1px solid var(--border)';
                            }}
                            placeholder={getDocumentPlaceholder(documentTypeDescription || tipoDocumentoSeleccionado)}
                        />
                        {(errors as any).cedula && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).cedula.message}</p>
                        )}
                        {!((errors as any).cedula) && documentError && (
                            <p className="text-red-500 text-sm mt-1">{documentError}</p>
                        )}
                    </div>

                    {/* DV */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            DV
                        </label>
                        <input
                            {...register('dv' as any)}
                            type="text"
                            maxLength={2}
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: (errors as any).dv ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = (errors as any).dv ? '1px solid var(--error)' : '1px solid var(--border)'}
                            placeholder="0-99"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                        />
                        {(errors as any).dv && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).dv.message}</p>
                        )}
                    </div>

                    {/* Género */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Género <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="genero" as any
                            control={control}
                            render={({ field, fieldState }) => (
                                <GenderSelector
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    error={fieldState.error?.message ? 'Campo requerido' : undefined}
                                    required
                                />
                            )}
                        />
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Fecha de Nacimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('fechaNacimiento' as any)}
                            type="date"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: (errors as any).fechaNacimiento ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = (errors as any).fechaNacimiento ? '1px solid var(--error)' : '1px solid var(--border)'}
                        />
                        {(errors as any).fechaNacimiento && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).fechaNacimiento.message}</p>
                        )}
                    </div>

                    {/* Tipo de Teléfono */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Tipo de Teléfono <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="tipoTelefono" as any
                            control={control}
                            render={({ field }) => (
                                <TelephoneTypeSelector
                                    value={field.value || ''}
                                    onChange={(selection: TelephoneTypeSelection) => {
                                        field.onChange(selection.telephoneTypeId);
                                        setTelephoneTypeDescription(selection.description);
                                        // Limpiar el teléfono y error cuando cambia el tipo
                                        formParticular.setValue('telefono', '');
                                        setPhoneError('');
                                    }}
                                    error={(errors as any).tipoTelefono?.message}
                                    required
                                />
                            )}
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('telefono' as any, {
                                onChange: () => {
                                    if (phoneError) {
                                        setPhoneError('');
                                    }
                                }
                            })}
                            type="tel"
                            maxLength={getPhoneConfig(telephoneTypeDescription).maxLength}
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: ((errors as any).telefono || phoneError) ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => {
                                const value = e.target.value;
                                if (value) {
                                    const validation = validatePhone(value, telephoneTypeDescription);
                                    if (!validation.isValid) {
                                        setPhoneError(validation.message);
                                    } else {
                                        setPhoneError('');
                                    }
                                } else {
                                    setPhoneError('');
                                }
                                e.currentTarget.style.border = ((errors as any).telefono || phoneError) ? '1px solid var(--error)' : '1px solid var(--border)';
                            }}
                            placeholder={getPhoneConfig(telephoneTypeDescription).placeholder}
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                        />
                        {(errors as any).telefono && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).telefono.message}</p>
                        )}
                        {!((errors as any).telefono) && phoneError && (
                            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                        )}
                    </div>

                    {/* Nivel de Educación */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Nivel de Educación
                        </label>
                        <Controller
                            name="nivelEducacion" as any
                            control={control}
                            render={({ field }) => (
                                <EducationalLevelSelector
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={(errors as any).nivelEducacion?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Nacionalidad */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Nacionalidad
                        </label>
                        <Controller
                            name="nacionalidad" as any
                            control={control}
                            render={({ field }) => (
                                <NationalitySelector
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={(errors as any).nacionalidad?.message}
                                />
                            )}
                        />
                    </div>

                    {/* País */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            País
                        </label>
                        <Controller
                            name="pais" as any
                            control={control}
                            render={({ field }) => (
                                <CountrySelector
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={(errors as any).pais?.message}
                                />
                            )}
                        />
                    </div>

                    {/* Estado Civil */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Estado Civil
                        </label>
                        <Controller
                            name="estadoCivil" as any
                            control={control}
                            render={({ field }) => (
                                <MaritalStatusSelector
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    error={(errors as any).estadoCivil?.message}
                                />
                            )}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre Legal */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Nombre Legal <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('nombreLegal' as any)}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: (errors as any).nombreLegal ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = (errors as any).nombreLegal ? '1px solid var(--error)' : '1px solid var(--border)'}
                            placeholder="Nombre registrado de la empresa"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,&-]/g, '');
                            }}
                        />
                        {(errors as any).nombreLegal && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).nombreLegal.message}</p>
                        )}
                    </div>

                    {/* Nombre Comercial */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Nombre Comercial <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('nombreComercial' as any)}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: (errors as any).nombreComercial ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = (errors as any).nombreComercial ? '1px solid var(--error)' : '1px solid var(--border)'}
                            placeholder="Nombre comercial"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,&-]/g, '');
                            }}
                        />
                        {(errors as any).nombreComercial && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).nombreComercial.message}</p>
                        )}
                    </div>

                    {/* Tipo de Documento */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Tipo de Documento
                        </label>
                        <Controller
                            name="tipoDocumento" as any
                            control={control}
                            render={({ field }) => (
                                <DocumentTypeSelector
                                    value={field.value || ''}
                                    onChange={(selection: DocumentTypeSelection) => {
                                        // Guardar el ID en el form (para enviar al API)
                                        field.onChange(selection.documentTypeId);
                                        // Guardar la descripción para validación de regex
                                        setDocumentTypeDescription(selection.description);
                                    }}
                                    customerTypeId={CUSTOMER_TYPE_IDS.EMPRESA}
                                />
                            )}
                        />
                    </div>

                    {/* RUC / Documento */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {getDocumentFieldLabel(documentTypeDescription || tipoDocumentoSeleccionado)} <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('ruc' as any, {
                                onChange: () => {
                                    if (documentError) {
                                        setDocumentError('');
                                    }
                                }
                            })}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: ((errors as any).ruc || documentError) ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => {
                                const value = e.target.value;
                                const tipoDoc = documentTypeDescription || tipoDocumentoSeleccionado;
                                if (value && !validateDocument(value, tipoDoc)) {
                                    setDocumentError(getDocumentRegex(tipoDoc, tipoCliente).message);
                                } else {
                                    setDocumentError('');
                                }
                                e.currentTarget.style.border = ((errors as any).ruc || documentError) ? '1px solid var(--error)' : '1px solid var(--border)';
                            }}
                            placeholder={getDocumentPlaceholder(documentTypeDescription || tipoDocumentoSeleccionado)}
                        />
                        {(errors as any).ruc && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).ruc.message}</p>
                        )}
                        {!((errors as any).ruc) && documentError && (
                            <p className="text-red-500 text-sm mt-1">{documentError}</p>
                        )}
                    </div>

                    {/* DV */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            DV <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('dv' as any)}
                            type="text"
                            maxLength={2}
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: (errors as any).dv ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = (errors as any).dv ? '1px solid var(--error)' : '1px solid var(--border)'}
                            placeholder="0-99"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                        />
                        {(errors as any).dv && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).dv.message}</p>
                        )}
                    </div>

                    {/* Tipo de Teléfono */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Tipo de Teléfono <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="tipoTelefono" as any
                            control={control}
                            render={({ field }) => (
                                <TelephoneTypeSelector
                                    value={field.value || ''}
                                    onChange={(selection: TelephoneTypeSelection) => {
                                        field.onChange(selection.telephoneTypeId);
                                        setTelephoneTypeDescription(selection.description);
                                        // Limpiar el teléfono y error cuando cambia el tipo
                                        formEmpresa.setValue('telefono', '');
                                        setPhoneError('');
                                    }}
                                    error={(errors as any).tipoTelefono?.message}
                                    required
                                />
                            )}
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('telefono' as any, {
                                onChange: () => {
                                    if (phoneError) {
                                        setPhoneError('');
                                    }
                                }
                            })}
                            type="tel"
                            maxLength={getPhoneConfig(telephoneTypeDescription).maxLength}
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: ((errors as any).telefono || phoneError) ? '1px solid var(--error)' : '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => {
                                const value = e.target.value;
                                if (value) {
                                    const validation = validatePhone(value, telephoneTypeDescription);
                                    if (!validation.isValid) {
                                        setPhoneError(validation.message);
                                    } else {
                                        setPhoneError('');
                                    }
                                } else {
                                    setPhoneError('');
                                }
                                e.currentTarget.style.border = ((errors as any).telefono || phoneError) ? '1px solid var(--error)' : '1px solid var(--border)';
                            }}
                            placeholder={getPhoneConfig(telephoneTypeDescription).placeholder}
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                        />
                        {(errors as any).telefono && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).telefono.message}</p>
                        )}
                        {!((errors as any).telefono) && phoneError && (
                            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                        )}
                    </div>

                    {/* Código de Recurrencia */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Código de Recurrencia de Visita
                        </label>
                        <input
                            {...register('codigoRecurrencia' as any)}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                            placeholder="Código de recurrencia"
                        />
                    </div>

                    {/* Actividad Comercial */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Actividad Comercial
                        </label>
                        <input
                            {...register('actividadComercial' as any)}
                            type="text"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                            placeholder="Ej: Comercio al por mayor"
                        />
                    </div>

                    {/* Sitio Web */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Sitio Web
                        </label>
                        <input
                            {...register('sitioWeb' as any)}
                            type="url"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                            placeholder="https://www.ejemplo.com"
                        />
                        {(errors as any).sitioWeb && (
                            <p className="text-red-500 text-sm mt-1">{(errors as any).sitioWeb.message}</p>
                        )}
                    </div>

                    {/* Año de Fundación */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Año de Fundación
                        </label>
                        <input
                            {...register('anioFundacion' as any)}
                            type="text"
                            maxLength={4}
                            className="w-full px-4 py-2 rounded-lg focus:outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)'
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid var(--primary)'}
                            onBlur={(e) => e.currentTarget.style.border = '1px solid var(--border)'}
                            placeholder="Ej: 2020"
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                        />
                    </div>

                    {/* País */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            País
                        </label>
                        <Controller
                            name="pais" as any
                            control={control}
                            render={({ field }) => (
                                <CountrySelector
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-4 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-lg transition-colors"
                    style={{
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--card)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--card)'}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 text-white rounded-lg transition-all"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    Registrar Cliente
                </button>
            </div>
        </form>
    );
}
