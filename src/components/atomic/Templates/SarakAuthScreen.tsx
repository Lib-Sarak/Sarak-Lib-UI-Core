import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    Lock,
    User,
    Eye,
    EyeOff,
    ShieldCheck,
    Activity,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { SocialButton } from '../Atoms/SocialButton';
import { SarakButton, SarakIconButton } from '../Buttons';
import { SarakInput } from '../Inputs';

interface SarakAuthScreenProps {
    branding?: {
        name: string;
        logo?: string;
    };
    isRegistering: boolean;
    setIsRegistering: (val: boolean) => void;
    mfaStep: boolean;
    setMfaStep: (val: boolean) => void;
    username: string;
    setUsername: (val: string) => void;
    password?: string;
    setPassword?: (val: string) => void;
    mfaCode?: string;
    setMfaCode?: (val: string) => void;
    showPassword?: boolean;
    setShowPassword?: (val: boolean) => void;
    error?: string;
    isPending?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onSocialLogin?: (provider: string) => void;
    socialConfig?: {
        enabled: boolean;
        display: 'compact' | 'full';
        providers: Array<{ id: string; variant: any }>;
    };
    onForgot?: () => void;
    onMasterLogin?: () => void;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

/**
 * SarakAuthScreen (Industrial Template v9.5)
 * 
 * Template soberano para fluxos de autenticação.
 * Mantenha a fidelidade visual absoluta aos tokens de design.
 */
export const SarakAuthScreen: React.FC<SarakAuthScreenProps> = ({
    branding,
    isRegistering,
    setIsRegistering,
    mfaStep,
    setMfaStep,
    username,
    setUsername,
    password,
    setPassword,
    mfaCode,
    setMfaCode,
    showPassword,
    setShowPassword,
    error,
    isPending,
    onSubmit,
    onSocialLogin,
    socialConfig,
    onForgot,
    onMasterLogin
}) => {
    return (
        <div className="min-h-screen w-full flex bg-theme-body text-theme-text selection:bg-theme-primary/30 font-sans overflow-hidden">

            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-theme-body via-theme-body to-theme-primary/20 items-center justify-center p-12">

                {/* Animated Decorative Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-theme-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-theme-secondary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
                </div>

                {/* Visual Grid */}
                <div 
                    className="absolute inset-0 opacity-[var(--sarak-noise-opacity,0.2)] mix-blend-overlay pointer-events-none"
                    style={{ 
                        backgroundImage: 'var(--sarak-auth-noise-url)',
                        display: 'var(--sarak-auth-noise-enabled, block)'
                    }}
                ></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--theme-border) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                <div 
                    className="relative z-10 max-w-xl text-center flex flex-col items-center"
                    style={{ gap: 'var(--sarak-auth-gap, 2rem)' }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="w-24 h-24 bg-gradient-to-tr from-theme-primary to-theme-primary/60 flex items-center justify-center shadow-2xl shadow-theme-primary/20 border border-theme-border"
                        style={{ borderRadius: 'var(--button-radius, 12px)' }}
                    >
                        {branding?.logo ? (
                            <img src={branding.logo} alt="Logo" className="w-12 h-12 object-contain" />
                        ) : (
                            <Cpu className="w-12 h-12 text-theme-title" />
                        )}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-6xl font-black tracking-tighter bg-gradient-to-r from-theme-primary via-white to-theme-primary bg-[length:200%_auto] animate-gradient-text bg-clip-text text-transparent uppercase"
                    >
                        {branding?.name}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="mt-12 flex gap-4"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full sarak-glass bg-theme-card border border-theme-border backdrop-blur-md">
                            <ShieldCheck className="w-4 h-4 text-theme-secondary" />
                            <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">Secure</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full sarak-glass bg-theme-card border border-theme-border backdrop-blur-md">
                            <Activity className="w-4 h-4 text-theme-primary" />
                            <span className="text-xs font-bold text-theme-muted uppercase tracking-widest">Neural</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-theme-body border-l border-theme-border shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative">
                
                {/* Floating Elements in Background */}
                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-theme-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl animate-pulse [animation-delay:3s]"></div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 block lg:hidden text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                            {branding?.logo ? (
                                <img src={branding.logo} alt="Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <Cpu className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">{branding?.name}</h2>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-3xl font-black text-theme-text mb-2 tracking-tight">
                            {mfaStep ? 'Verificação MFA' : (isRegistering ? 'Criação de Conta' : 'Login do Sistema')}
                        </h3>
                        <p className="text-theme-muted font-medium">
                            {mfaStep 
                                ? 'Insira o código de 6 dígitos gerado pelo seu app de autenticação.' 
                                : (isRegistering ? 'Digite seu e-mail e escolha uma senha segura.' : 'Insira suas credenciais para continuar.')
                            }
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className={`mb-6 p-4 border rounded-xl flex items-center gap-3 text-sm font-medium shadow-lg transition-all ${
                                    error.includes('tentativas') 
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                }`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${error.includes('tentativas') ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-red-500"}`}></div>
                                <span className="flex-1">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {!mfaStep ? (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-theme-muted uppercase tracking-widest ml-1">E-mail de Acesso</label>
                                    <SarakInput
                                        type="email"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="seu@email.com"
                                        autoComplete="off"
                                        leftIcon={<User className="h-5 w-5" />}
                                        fullWidth
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-xs font-bold text-theme-muted uppercase tracking-widest">Senha</label>
                                        {!isRegistering && onForgot && (
                                            <SarakButton 
                                                onClick={onForgot}
                                                variant="ghost"
                                                className="text-xs font-bold text-theme-primary px-0 py-0 h-auto hover:opacity-80"
                                            >
                                                Esqueceu?
                                            </SarakButton>
                                        )}
                                    </div>
                                    <SarakInput
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password || ''}
                                        onChange={(e) => setPassword?.(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        leftIcon={<Lock className="h-5 w-5" />}
                                        rightIcon={setShowPassword ? (
                                            <SarakIconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                icon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                variant="ghost"
                                                className="text-[var(--sarak-input-icon-color,var(--theme-muted))] hover:text-theme-text px-1 py-1"
                                            />
                                        ) : undefined}
                                        fullWidth
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-theme-muted uppercase tracking-widest ml-1">Código de Segurança</label>
                                <SarakInput
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={mfaCode || ''}
                                    onChange={(e) => setMfaCode?.(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    autoFocus
                                    className="text-center text-2xl tracking-[0.5em]"
                                    leftIcon={<ShieldCheck className="h-5 w-5" />}
                                    fullWidth
                                />
                                <SarakButton 
                                    onClick={() => setMfaStep(false)}
                                    variant="ghost"
                                    className="text-xs font-bold text-theme-muted hover:text-theme-primary mt-2 px-0 h-auto"
                                >
                                    ← Voltar para senha
                                </SarakButton>
                            </div>
                        )}

                        <SarakButton
                            type="submit"
                            isLoading={isPending}
                            variant="primary"
                            fullWidth
                            className="mt-4"
                            rightIcon={!isPending ? <ChevronRight className="w-4 h-4" /> : undefined}
                        >
                            {mfaStep ? 'Confirmar Acesso' : (isRegistering ? 'Criar Minha Conta' : 'Acessar Sistema')}
                        </SarakButton>
                    </form>

                    {/* Social Login Section */}
                    {socialConfig?.enabled && (
                        <div className="mt-8 space-y-6">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <span className="relative px-4 bg-theme-body text-[8px] font-black text-theme-muted uppercase tracking-[0.3em]">Ou continue com</span>
                            </div>

                            <div className={`grid gap-3 ${socialConfig.display === 'compact' ? "grid-cols-4" : "grid-cols-1"}`}>
                                {socialConfig.providers.map((p) => (
                                    <SocialButton 
                                        key={p.id} 
                                        provider={p.id as any} 
                                        variant={p.variant} 
                                        hideLabel={socialConfig.display === 'compact'}
                                        onClick={() => onSocialLogin?.(p.id)} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {onMasterLogin && (
                        <div className="mt-8 space-y-3">
                            {!isRegistering && (
                                <SarakButton
                                    type="button"
                                    onClick={onMasterLogin}
                                    variant="secondary"
                                    fullWidth
                                    className="uppercase"
                                >
                                    ENTRAR COMO MASTER
                                </SarakButton>
                            )}
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-theme-border text-center">
                        <p className="text-theme-muted text-sm font-medium">
                            {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'} 
                            <SarakButton 
                                onClick={() => setIsRegistering(!isRegistering)}
                                variant="ghost"
                                className="ml-1 text-theme-primary font-bold hover:underline px-0 py-0 h-auto"
                            >
                                {isRegistering ? 'Fazer Login' : 'Primeiro Acesso'}
                            </SarakButton>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
