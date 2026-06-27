import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { SarakButton } from '../../Buttons';
import { AuthSocialLogin } from './AuthSocialLogin';
import { AuthFormFields } from './AuthFormFields';

interface AuthFormProps {
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
        providers: Array<{ id: string; variant: 'glass' | 'sovereign' }>;
    };
    onForgot?: () => void;
    onMasterLogin?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
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
        <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-theme-body border-l border-[var(--sx-color-border-base)]-border shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative">
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
                    <AuthFormFields
                        mfaStep={mfaStep}
                        isRegistering={isRegistering}
                        username={username}
                        setUsername={setUsername}
                        password={password}
                        setPassword={setPassword}
                        mfaCode={mfaCode}
                        setMfaCode={setMfaCode}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        isPending={isPending}
                        setMfaStep={setMfaStep}
                        onForgot={onForgot}
                    />
                </form>

                {/* Social Login Section */}
                <AuthSocialLogin socialConfig={socialConfig} onSocialLogin={onSocialLogin} />

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

                <div className="mt-10 pt-8 border-t border-[var(--sx-color-border-base)]-border text-center">
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
    );
};
