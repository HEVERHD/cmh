// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';  // ← AGREGAR ESTE IMPORT

type Step = 'company' | 'credentials';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const { login, isLoading: authLoading, error: authError, clearError: clearAuthError } = useAuthStore();
    const { tenant, validateCompany, isLoading: tenantLoading, error: tenantError, clearError: clearTenantError, isValidated, clearTenant } = useTenantStore();  // ← CORREGIR: era "useTenantStor" sin la 'e'

    const [step, setStep] = useState<Step>('company');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isValidated && tenant) {
            setStep('credentials');
        }
    }, [isValidated, tenant]);

    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearTenantError();
        try {
            await validateCompany(companyName.trim());
            setStep('credentials');
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
        setStep('company');
        setEmail('');
        setPassword('');
    };

    const isLoading = tenantLoading || authLoading;
    const error = step === 'company' ? tenantError : authError;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="px-6 pt-8 pb-6 text-center">
                            {step === 'credentials' && tenant ? (
                                <>
                                    {tenant.branding.logo ? (
                                        <img src={tenant.branding.logo} alt={tenant.name} className="mx-auto h-16 w-auto mb-4" />
                                    ) : (
                                        <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg" style={{ backgroundColor: tenant.branding.primaryColor }}>
                                            {tenant.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <h1 className="text-2xl font-bold text-white">{tenant.tradeName || tenant.name}</h1>
                                    <p className="text-slate-300 mt-1 text-sm">Ingresa tus credenciales</p>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-bold text-white">Club de Mercancía</h1>
                                    <p className="text-slate-300 mt-1 text-sm">Ingresa el nombre de tu compañía</p>
                                </>
                            )}
                        </div>

                        <div className="px-6 pb-8">
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-red-200 text-sm">{error}</span>
                                </div>
                            )}

                            {step === 'company' ? (
                                <form onSubmit={handleCompanySubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Nombre de la compañía</label>
                                        <div className="relative">
                                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ej: cochez" required autoFocus className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isLoading || !companyName.trim()} className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Verificando...</span></>
                                        ) : (
                                            <><span>Continuar</span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                    <button type="button" onClick={handleBack} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors mb-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        Cambiar compañía
                                    </button>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required autoFocus className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0" />
                                            <span className="text-sm text-slate-300">Recordarme</span>
                                        </label>
                                        <a href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">¿Olvidaste tu contraseña?</a>
                                    </div>
                                    <button type="submit" disabled={isLoading || !email.trim() || !password} className="w-full py-3.5 px-4 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ background: tenant?.branding.primaryColor ? `linear-gradient(to right, ${tenant.branding.primaryColor}, ${tenant.branding.secondaryColor || tenant.branding.primaryColor})` : 'linear-gradient(to right, #3B82F6, #2563EB)', boxShadow: `0 10px 25px -5px ${tenant?.branding.primaryColor || '#3B82F6'}40` }}>
                                        {isLoading ? (
                                            <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>Iniciando sesión...</span></>
                                        ) : (
                                            <><span>Iniciar sesión</span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                    <p className="text-center text-slate-500 text-xs mt-6">Powered by <span className="text-slate-400 font-medium">Aludra</span></p>
                </div>
            </div>

            <div className="flex justify-center gap-2 pb-6 relative z-10">
                <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step === 'company' ? 'bg-blue-500' : 'bg-white/20'}`} />
                <div className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step === 'credentials' ? 'bg-blue-500' : 'bg-white/20'}`} />
            </div>
        </div>
    );
}