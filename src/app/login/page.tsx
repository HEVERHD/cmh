// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store"; // ← AGREGAR ESTE IMPORT

type Step = "company" | "credentials";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const {
    login,
    isLoading: authLoading,
    error: authError,
    clearError: clearAuthError,
  } = useAuthStore();
  const {
    tenant,
    validateCompany,
    isLoading: tenantLoading,
    error: tenantError,
    clearError: clearTenantError,
    isValidated,
    clearTenant,
  } = useTenantStore(); // ← CORREGIR: era "useTenantStor" sin la 'e'

  const [step, setStep] = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isValidated && tenant) {
      setStep("credentials");
    }
  }, [isValidated, tenant]);

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearTenantError();
    try {
      await validateCompany(companyName.trim());
      setStep("credentials");
    } catch (err) {
      // Error manejado en store
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    if (!tenant) return;
    try {
      await login({
        email: email.trim(),
        password,
        tenantId: tenant.id,
        rememberMe,
      });
      router.push(redirect);
    } catch (err) {
      // Error manejado en store
    }
  };

  const handleBack = () => {
    clearTenant();
    clearAuthError();
    setStep("company");
    setEmail("");
    setPassword("");
  };

  const isLoading = tenantLoading || authLoading;
  const error = step === "company" ? tenantError : authError;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(to bottom right, #1a1d24, #242832, #1a1d24)",
      }}
    >
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-md">
          <div
            className="backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(45, 50, 60, 0.6)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              boxShadow:
                "0 25px 50px -12px rgba(59, 130, 246, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="px-6 pt-8 pb-6 text-center">
              {step === "credentials" && tenant ? (
                <>
                  <img
                    src="/logo.png"
                    alt="Club de Mercancías"
                    className="mx-auto h-32 w-auto mb-6"
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                      filter: "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.1))",
                    }}
                  />
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {tenant.tradeName || tenant.name}
                  </h1>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Ingresa tus credenciales
                  </p>
                </>
              ) : (
                <>
                  <img
                    src="/logo.png"
                    alt="Club de Mercancías"
                    className="mx-auto h-32 w-auto mb-6"
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                      filter: "drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.1))",
                    }}
                  />
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Club de Mercancías
                  </h1>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Ingresa el nombre de tu compañía
                  </p>
                </>
              )}
            </div>

            <div className="px-6 pb-8">
              {error && (
                <div
                  className="mb-4 p-3 rounded-xl flex items-start gap-3"
                  style={{
                    backgroundColor: "var(--error-bg)",
                    border: "1px solid var(--error)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <svg
                    className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}

              {step === "company" ? (
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Nombre de la compañía
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="ej: cochez"
                        required
                        autoFocus
                        className="w-full px-4 py-3.5 rounded-xl focus:outline-none transition-all backdrop-blur-sm"
                        style={{
                          backgroundColor: "rgba(36, 40, 50, 0.6)",
                          border: "1px solid rgba(58, 65, 80, 0.6)",
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) => {
                          e.target.style.border = "2px solid var(--primary)";
                          e.target.style.backgroundColor =
                            "rgba(36, 40, 50, 0.8)";
                        }}
                        onBlur={(e) => {
                          e.target.style.border =
                            "1px solid rgba(58, 65, 80, 0.6)";
                          e.target.style.backgroundColor =
                            "rgba(36, 40, 50, 0.6)";
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !companyName.trim()}
                    className="w-full py-3.5 px-4 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background:
                        "linear-gradient(to right, var(--primary), var(--primary-glow))",
                      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <span>Continuar</span>
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 text-sm transition-colors mb-2"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--text-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Cambiar compañía
                  </button>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      autoFocus
                      className="form-control w-full px-4 py-3.5 rounded-xl focus:outline-none transition-all backdrop-blur-sm"
                      style={{
                        backgroundColor: "rgba(36, 40, 50, 0.6)",
                        border: "1px solid rgba(58, 65, 80, 0.6)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) => {
                        e.target.style.border = "2px solid var(--primary)";
                        e.target.style.backgroundColor =
                          "rgba(36, 40, 50, 0.8)";
                      }}
                      onBlur={(e) => {
                        e.target.style.border =
                          "1px solid rgba(58, 65, 80, 0.6)";
                        e.target.style.backgroundColor =
                          "rgba(36, 40, 50, 0.6)";
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3.5 rounded-xl focus:outline-none transition-all pr-12 backdrop-blur-sm"
                        style={{
                          backgroundColor: "rgba(36, 40, 50, 0.6)",
                          border: "1px solid rgba(58, 65, 80, 0.6)",
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) => {
                          e.target.style.border = "2px solid var(--primary)";
                          e.target.style.backgroundColor =
                            "rgba(36, 40, 50, 0.8)";
                        }}
                        onBlur={(e) => {
                          e.target.style.border =
                            "1px solid rgba(58, 65, 80, 0.6)";
                          e.target.style.backgroundColor =
                            "rgba(36, 40, 50, 0.6)";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--text-primary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--text-muted)")
                        }
                      >
                        {showPassword ? (
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded focus:ring-offset-0 backdrop-blur-sm"
                        style={{
                          borderColor: "rgba(58, 65, 80, 0.6)",
                          backgroundColor: "rgba(36, 40, 50, 0.6)",
                          accentColor: "var(--primary)",
                        }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Recordarme
                      </span>
                    </label>
                    <a
                      href="/forgot-password"
                      className="text-sm transition-colors"
                      style={{ color: "var(--primary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--primary-glow)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--primary)")
                      }
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim() || !password}
                    className="w-full py-3.5 px-4 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: tenant?.branding.primaryColor
                        ? `linear-gradient(to right, ${
                            tenant.branding.primaryColor
                          }, ${
                            tenant.branding.secondaryColor ||
                            tenant.branding.primaryColor
                          })`
                        : "linear-gradient(to right, #3B82F6, #2563EB)",
                      boxShadow: `0 10px 25px -5px ${
                        tenant?.branding.primaryColor || "#3B82F6"
                      }40`,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar sesión</span>
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
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
          <p
            className="text-center text-xs mt-6"
            style={{ color: "var(--text-muted)" }}
          >
            Powered by{" "}
            <span
              className="font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Hypernovalabs
            </span>
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-2 pb-6 relative z-10">
        <div
          className="h-1.5 w-8 rounded-full transition-all duration-300"
          style={{
            backgroundColor:
              step === "company" ? "var(--primary)" : "var(--border)",
            boxShadow:
              step === "company" ? "0 0 10px rgba(59, 130, 246, 0.5)" : "none",
          }}
        />
        <div
          className="h-1.5 w-8 rounded-full transition-all duration-300"
          style={{
            backgroundColor:
              step === "credentials" ? "var(--primary)" : "var(--border)",
            boxShadow:
              step === "credentials"
                ? "0 0 10px rgba(59, 130, 246, 0.5)"
                : "none",
          }}
        />
      </div>
    </div>
  );
}
