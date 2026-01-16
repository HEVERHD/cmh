"use client";

import { useState, useEffect, useRef } from "react";
import {
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Loader2,
} from "lucide-react";
import {
  useClubs,
  useClubTypes,
  useClubStatuses,
  useDenominations,
  useCreateClub,
} from "@/lib/hooks/useClubs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ClubDetailSheet } from "@/components/clubes/ClubDetailSheet";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ClubFilters } from "@/types/club";
import { Badge } from "@/components/ui/badge";
import { ClienteSearchSelect } from "@/components/shared/ClienteSearchSelect";
import { DEFAULT_VALUES } from "@/lib/data/mockData";
import { toast } from "sonner";

const statusColors: Record<string, { bg: string; text: string }> = {
  activo: { bg: "var(--success-bg)", text: "var(--success)" },
  anulado: { bg: "var(--error-bg)", text: "var(--error)" },
  cerrado: { bg: "var(--muted-bg)", text: "var(--text-muted)" },
  "en auditoría": { bg: "var(--warning-bg)", text: "var(--warning)" },
};

export default function ClubesPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<ClubFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    clubTypeId: "",
    denominationId: "",
    share: 1,
    startDate: new Date().toISOString().split("T")[0],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Ref para prevenir doble llamado en desarrollo
  const hasLoadedRef = useRef(false);
  const [isFiltersReady, setIsFiltersReady] = useState(false);

  const { data: clubTypes } = useClubTypes();
  const { data: clubStatuses, isLoading: isLoadingStatuses } =
    useClubStatuses();
  const { data: denominations } = useDenominations();

  // Establecer filtro por defecto de estado "Activo" antes de cargar clubes
  useEffect(() => {
    if (clubStatuses && clubStatuses.length > 0 && !isFiltersReady) {
      const activoStatus = clubStatuses.find(
        (s) => s.name.toLowerCase() === "vencido"
      );
      if (activoStatus) {
        setFilters({
          clubStatusId: activoStatus.clubStatusId,
          statusName: activoStatus.name,
        });
        setIsFiltersReady(true);
      }
    }
  }, [clubStatuses, isFiltersReady]);

  // Solo cargar clubes después de que el filtro esté listo
  const {
    data: clubsData,
    isLoading: isLoadingClubs,
    isFetching,
    refetch,
  } = useClubs(filters, page, pageSize, { enabled: isFiltersReady });

  // Loader unificado: desde estados hasta clubes
  const isLoading = isLoadingStatuses || isLoadingClubs;

  const createMutation = useCreateClub();

  // Prevenir doble llamado inicial
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key: keyof ClubFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const handleStatusFilterChange = (statusId: string) => {
    if (!statusId) {
      setFilters((prev) => ({
        ...prev,
        clubStatusId: undefined,
        statusName: undefined,
      }));
    } else {
      const status = clubStatuses?.find((s) => s.clubStatusId === statusId);
      setFilters((prev) => ({
        ...prev,
        clubStatusId: statusId,
        statusName: status?.name,
      }));
    }
    setPage(1);
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setPage(1);
  };

  const clearFilters = () => {
    // Restablecer al filtro por defecto (Activo)
    const activoStatus = clubStatuses?.find(
      (s) => s.name.toLowerCase() === "activo"
    );
    if (activoStatus) {
      setFilters({
        clubStatusId: activoStatus.clubStatusId,
        statusName: activoStatus.name,
      });
    } else {
      setFilters({});
    }
    setSearchInput("");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const activeFiltersCount = Object.keys(filters).filter((k) => {
    const key = k as keyof ClubFilters;
    // No contar 'search', 'statusName' (es complementario), ni el estado "Activo" por defecto
    if (k === "search" || k === "statusName") return false;
    if (k === "clubStatusId") {
      const activoStatus = clubStatuses?.find(
        (s) => s.name.toLowerCase() === "activo"
      );
      return filters[key] && filters[key] !== activoStatus?.clubStatusId;
    }
    return !!filters[key];
  }).length;

  const totalPages = clubsData?.totalPages || 1;
  const totalCount = clubsData?.total || 0;

  // Validación del formulario
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customerId.trim()) {
      errors.customerId = "Cliente es requerido";
    }
    if (!formData.clubTypeId.trim()) {
      errors.clubTypeId = "Tipo de club es requerido";
    }
    if (!formData.denominationId.trim()) {
      errors.denominationId = "Denominación es requerida";
    }
    if (formData.share < 1 || formData.share > 99) {
      errors.share = "Acción debe estar entre 1 y 99";
    }
    if (!formData.startDate.trim()) {
      errors.startDate = "Fecha de inicio es requerida";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir formulario
  const openCreateForm = () => {
    setFormData({
      customerId: "",
      clubTypeId: "",
      denominationId: "",
      share: 1,
      startDate: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setShowCreateForm(true);
  };

  // Cerrar formulario
  const closeCreateForm = () => {
    setShowCreateForm(false);
    setFormData({
      customerId: "",
      clubTypeId: "",
      denominationId: "",
      share: 1,
      startDate: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
  };

  // Manejar cambios en inputs
  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Calcular información adicional
  const getShareLimit = (share: number) => {
    if (share >= 1 && share <= 39) return 100;
    if (share >= 40 && share <= 99) return 300;
    return 0;
  };

  const selectedDenomination = denominations?.find(
    (d) => d.denominationId === formData.denominationId
  );
  const weeklyAmount = selectedDenomination?.value || 0;
  const totalAmount = weeklyAmount * 52;

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0] + ".000";
      const formattedDate = `${formData.startDate} ${timeStr}`;

      await createMutation.mutateAsync({
        ...formData,
        startDate: formattedDate,
        saaSId: DEFAULT_VALUES.saaSId,
        salesAgentId: DEFAULT_VALUES.salesAgentId,
        storeId: DEFAULT_VALUES.storeId,
      });

      toast.success("Club creado exitosamente");
      closeCreateForm();
      setSuccessMessage("Club creado exitosamente");
      refetch();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error("Error creando club:", err);
      const errorMessage = err?.message || "Error al crear club";
      toast.error("Error al crear club", {
        description: errorMessage,
      });
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Gestión de Clubes
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Administra clubes, semanas y transacciones
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={openCreateForm}
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--primary-glow)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--primary)")
            }
          >
            + Nuevo Club
          </button>
        )}
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div
          className="px-4 py-3 rounded-lg flex items-center"
          style={{
            backgroundColor: "var(--success-bg)",
            border: "1px solid var(--success)",
            color: "var(--success)",
          }}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {successMessage}
        </div>
      )}

      {error && (
        <div
          className="px-4 py-3 rounded-lg flex items-center"
          style={{
            backgroundColor: "var(--error-bg)",
            border: "1px solid var(--error)",
            color: "var(--error)",
          }}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto transition-colors"
            style={{ color: "var(--error)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Formulario de creación (si está activo) */}
      {showCreateForm ? (
        <div
          className="rounded-xl p-8 shadow-sm relative"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          {isSaving && (
            <div
              className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl"
              style={{ backgroundColor: "rgba(26, 29, 36, 0.95)" }}
            >
              <div
                className="flex flex-col items-center p-8 rounded-2xl shadow-xl"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border-accent)",
                }}
              >
                <div className="relative">
                  <div
                    className="w-16 h-16 border-4 rounded-full"
                    style={{ borderColor: "var(--border)" }}
                  ></div>
                  <div
                    className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0"
                    style={{ borderColor: "var(--primary)" }}
                  ></div>
                </div>
                <p
                  className="mt-4 text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Creando club
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Por favor espere un momento...
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Cliente <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <ClienteSearchSelect
                  onChange={(value) => handleInputChange("customerId", value)}
                  error={formErrors.customerId}
                />
              </div>

              {/* Tipo de Club */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Tipo de Club <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <Select
                  value={formData.clubTypeId}
                  onValueChange={(v) => handleInputChange("clubTypeId", v)}
                >
                  <SelectTrigger
                    style={{
                      border: formErrors.clubTypeId
                        ? "1px solid var(--error)"
                        : undefined,
                    }}
                  >
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubTypes?.map((type) => (
                      <SelectItem key={type.clubTypeId} value={type.clubTypeId}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.clubTypeId && (
                  <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
                    {formErrors.clubTypeId}
                  </p>
                )}
              </div>

              {/* Denominación */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Denominación <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <Select
                  value={formData.denominationId}
                  onValueChange={(v) => handleInputChange("denominationId", v)}
                >
                  <SelectTrigger
                    style={{
                      border: formErrors.denominationId
                        ? "1px solid var(--error)"
                        : undefined,
                    }}
                  >
                    <SelectValue placeholder="Seleccionar denominación" />
                  </SelectTrigger>
                  <SelectContent>
                    {denominations?.map((d) => (
                      <SelectItem
                        key={d.denominationId}
                        value={d.denominationId}
                      >
                        ${d.value} semanal
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.denominationId && (
                  <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
                    {formErrors.denominationId}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Acción <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                                        .share-custom-input::-webkit-inner-spin-button,
                                        .share-custom-input::-webkit-outer-spin-button {
                                            -webkit-appearance: none;
                                            margin: 0;
                                            display: none;
                                        }
                                        .share-custom-input {
                                            -moz-appearance: textfield;
                                        }
                                    `,
                  }}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formData.share}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= 99) {
                        handleInputChange("share", val);
                      }
                    }}
                    className="share-custom-input flex-1 px-4 py-2.5 rounded-lg focus:outline-none transition-all text-center font-semibold"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      border: formErrors.share
                        ? "1px solid var(--error)"
                        : "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) =>
                      !formErrors.share &&
                      (e.currentTarget.style.border =
                        "2px solid var(--primary)")
                    }
                    onBlur={(e) =>
                      !formErrors.share &&
                      (e.currentTarget.style.border = "1px solid var(--border)")
                    }
                  />
                  <div
                    className="flex rounded-lg overflow-hidden"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        formData.share > 1 &&
                        handleInputChange("share", formData.share - 1)
                      }
                      disabled={formData.share <= 1}
                      className="w-9 h-10 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--card)",
                        borderRight: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      onMouseEnter={(e) => {
                        if (formData.share > 1) {
                          e.currentTarget.style.backgroundColor =
                            "var(--card-hover)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--card)";
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        formData.share < 99 &&
                        handleInputChange("share", formData.share + 1)
                      }
                      disabled={formData.share >= 99}
                      className="w-9 h-10 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--card)",
                        color: "var(--text-primary)",
                      }}
                      onMouseEnter={(e) => {
                        if (formData.share < 99) {
                          e.currentTarget.style.backgroundColor =
                            "var(--card-hover)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--card)";
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {formErrors.share && (
                  <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
                    {formErrors.share}
                  </p>
                )}
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Límite: {getShareLimit(formData.share)}
                </p>
              </div>

              {/* Fecha de Inicio */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Fecha de Inicio{" "}
                  <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                                        .date-input::-webkit-calendar-picker-indicator {
                                            cursor: pointer;
                                            border-radius: 4px;
                                            padding: 4px;
                                            transition: all 0.2s;
                                            filter: invert(0.6);
                                        }
                                        .date-input::-webkit-calendar-picker-indicator:hover {
                                            background-color: var(--card-hover);
                                            filter: invert(0.8);
                                        }
                                    `,
                  }}
                />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className="date-input w-full px-4 py-2.5 rounded-lg focus:outline-none transition-all"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: formErrors.startDate
                      ? "1px solid var(--error)"
                      : "1px solid var(--border)",
                    color: "var(--text-primary)",
                    colorScheme: "dark",
                  }}
                  onFocus={(e) =>
                    !formErrors.startDate &&
                    (e.currentTarget.style.border = "2px solid var(--primary)")
                  }
                  onBlur={(e) =>
                    !formErrors.startDate &&
                    (e.currentTarget.style.border = "1px solid var(--border)")
                  }
                />
                {formErrors.startDate && (
                  <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
                    {formErrors.startDate}
                  </p>
                )}
              </div>
            </div>

            {/* Resumen */}
            {formData.denominationId && (
              <div
                className="mt-4 p-4 rounded-lg"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <h4
                  className="font-medium text-sm mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Resumen
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Semanal:
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${weeklyAmount}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Total (52 sem):
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${totalAmount}
                  </span>
                </div>
              </div>
            )}

            {/* Alerta para shares altos */}
            {formData.share >= 40 && (
              <div
                className="mt-4 px-4 py-3 rounded-lg flex items-start"
                style={{
                  backgroundColor: "var(--warning-bg)",
                  border: "1px solid var(--warning)",
                  color: "var(--warning)",
                }}
              >
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-sm">
                  Shares 40-99 tienen límite de 300 participantes.
                </span>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeCreateForm}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-lg font-medium transition-all"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--card)",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Crear Club
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="pb-2">
                <h3
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total Clubes
                </h3>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {isLoading ? <Skeleton className="h-8 w-16" /> : totalCount}
              </div>
            </div>
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="pb-2">
                <h3
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Activos
                </h3>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--success)" }}
              >
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  clubsData?.data?.filter((c) => c.active).length || 0
                )}
              </div>
            </div>
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="pb-2">
                <h3
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Monto Pagado
                </h3>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  formatCurrency(
                    clubsData?.data?.reduce(
                      (sum, c) => sum + c.paidAmount,
                      0
                    ) || 0
                  )
                )}
              </div>
            </div>
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="pb-2">
                <h3
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Balance Pendiente
                </h3>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--warning)" }}
              >
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  formatCurrency(
                    clubsData?.data?.reduce(
                      (sum, c) => sum + c.balanceAmount,
                      0
                    ) || 0
                  )
                )}
              </div>
            </div>
          </div>

          {/* Contenedor principal de tabla y búsqueda */}
          <div
            className="rounded-xl p-8 shadow-sm"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Barra de búsqueda y filtros */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Buscar por contrato, cliente o documento..."
                    className="w-full px-4 py-2 pl-10 rounded-lg focus:outline-none transition-all"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.border =
                        "2px solid var(--primary)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = "1px solid var(--border)")
                    }
                  />
                  <svg
                    className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: "var(--primary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--primary-glow)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--primary)")
                  }
                >
                  Buscar
                </button>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--card-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Actualizar lista"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--card-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </button>
              </div>

              {/* Filtros expandibles */}
              {showFilters && (
                <div
                  className="flex flex-col gap-4 pt-4"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div className="w-full md:w-64">
                    <Select
                      value={filters.clubStatusId || "all"}
                      onValueChange={(v) =>
                        handleStatusFilterChange(v === "all" ? "" : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        {clubStatuses?.map((status) => (
                          <SelectItem
                            key={status.clubStatusId}
                            value={status.clubStatusId}
                          >
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 rounded-lg transition-colors text-sm"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-secondary)")
                      }
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}

              {isFetching && !isLoading && (
                <div
                  className="flex items-center text-sm gap-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando...
                </div>
              )}
            </div>

            {/* Tabla */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div
                  className="flex flex-col items-center p-8 rounded-2xl shadow-sm"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-16 h-16 border-4 rounded-full"
                      style={{ borderColor: "var(--border)" }}
                    ></div>
                    <div
                      className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0"
                      style={{ borderColor: "var(--primary)" }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: "var(--primary)" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  </div>
                  <p
                    className="mt-5 text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Cargando clubes
                  </p>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Este proceso puede tardar hasta 1 minuto...
                  </p>
                  <div className="mt-4 flex space-x-1.5">
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        backgroundColor: "var(--primary)",
                        animationDelay: "0ms",
                      }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        backgroundColor: "var(--primary)",
                        animationDelay: "150ms",
                      }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        backgroundColor: "var(--primary)",
                        animationDelay: "300ms",
                      }}
                    ></span>
                  </div>
                </div>
              </div>
            ) : clubsData?.data && clubsData.data.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Clubes Registrados
                    <span
                      className="ml-2 text-sm font-normal"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      ({totalCount} total)
                    </span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table
                    className="min-w-full"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <thead style={{ backgroundColor: "var(--card-hover)" }}>
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Contrato
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Cliente
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Cédula
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Acción
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Estado
                        </th>
                        <th
                          className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Balance
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Fecha
                        </th>
                        <th
                          className="px-6 py-3 text-xs font-medium uppercase tracking-wider"
                          style={{ color: "var(--text-secondary)" }}
                        ></th>
                      </tr>
                    </thead>
                    <tbody style={{ borderColor: "var(--border)" }}>
                      {clubsData.data.map((club) => (
                        <tr
                          key={club.clubId}
                          className="cursor-pointer transition-colors"
                          style={{ borderTop: "1px solid var(--border)" }}
                          onClick={() => setSelectedClub(club)}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--card-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td
                            className="px-6 py-4 font-medium text-sm"
                            style={{ color: "var(--primary)" }}
                          >
                            {club.contractNumber}
                          </td>
                          <td
                            className="px-6 py-4 max-w-[200px] truncate text-sm"
                            style={{ color: "var(--text-primary)" }}
                            title={club.customerName}
                          >
                            {club.customerName || "-"}
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {club.customerNumber || "-"}
                          </td>
                          <td
                            className="px-6 py-4 font-medium text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {club.share}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="px-2.5 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor:
                                  statusColors[
                                    club.statusName?.toLowerCase() || ""
                                  ]?.bg || "var(--muted-bg)",
                                color:
                                  statusColors[
                                    club.statusName?.toLowerCase() || ""
                                  ]?.text || "var(--text-muted)",
                              }}
                            >
                              {club.statusName || "Desconocido"}
                            </span>
                          </td>
                          <td
                            className="px-6 py-4 text-right font-medium text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {formatCurrency(club.balanceAmount)}
                          </td>
                          <td
                            className="px-6 py-4 text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatDate(club.createdDate)}
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-lg transition-colors"
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "var(--muted-bg)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "transparent")
                                  }
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedClub(club);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalles
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div
                    className="flex justify-between items-center pt-4 mt-4"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <div
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Mostrando {clubsData.data.length} de {totalCount} clubes -
                      Página {page} de {totalPages}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={page === 1}
                        className="px-2 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) =>
                          !e.currentTarget.disabled &&
                          (e.currentTarget.style.backgroundColor =
                            "var(--card-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        title="Primera página"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || isFetching}
                        className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) =>
                          !e.currentTarget.disabled &&
                          (e.currentTarget.style.backgroundColor =
                            "var(--card-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        Anterior
                      </button>

                      {/* Números de página */}
                      <div className="flex gap-1 mx-2">
                        {(() => {
                          const pages = [];
                          let startPage = Math.max(1, page - 2);
                          let endPage = Math.min(totalPages, page + 2);

                          if (endPage - startPage < 4) {
                            if (startPage === 1) {
                              endPage = Math.min(totalPages, startPage + 4);
                            } else if (endPage === totalPages) {
                              startPage = Math.max(1, endPage - 4);
                            }
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            const isActive = page === i;
                            pages.push(
                              <button
                                key={i}
                                onClick={() => handlePageChange(i)}
                                className={`min-w-[36px] px-3 py-1 border rounded-lg text-sm font-medium transition-colors`}
                                style={
                                  isActive
                                    ? {
                                        backgroundColor: "var(--primary)",
                                        color: "var(--primary-foreground)",
                                        borderColor: "var(--primary)",
                                      }
                                    : {
                                        borderColor: "var(--border)",
                                        color: "var(--text-secondary)",
                                      }
                                }
                                onMouseEnter={(e) =>
                                  !isActive &&
                                  (e.currentTarget.style.backgroundColor =
                                    "var(--card-hover)")
                                }
                                onMouseLeave={(e) =>
                                  !isActive &&
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                {i}
                              </button>
                            );
                          }
                          return pages;
                        })()}
                      </div>

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages || isFetching}
                        className="px-3 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) =>
                          !e.currentTarget.disabled &&
                          (e.currentTarget.style.backgroundColor =
                            "var(--card-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        Siguiente
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={page === totalPages}
                        className="px-2 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) =>
                          !e.currentTarget.disabled &&
                          (e.currentTarget.style.backgroundColor =
                            "var(--card-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        title="Última página"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "var(--card-hover)" }}
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {filters.search
                    ? "No se encontraron clubes"
                    : "No hay clubes registrados"}
                </h3>
                <p
                  className="max-w-sm mx-auto"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {filters.search
                    ? "Intenta con otros términos de búsqueda o ajusta los filtros"
                    : 'Comienza registrando tu primer club haciendo clic en el botón "Nuevo Club".'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <ClubDetailSheet
        club={selectedClub}
        onClose={() => setSelectedClub(null)}
      />
    </div>
  );
}
