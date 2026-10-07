import React from 'react';
import { SarakIcon } from "../../Icon/SarakIcon";
import { motion, AnimatePresence } from 'framer-motion';

import { SarakButton } from '../../Buttons';
import { AuthSocialLogin, type SarakSocialConfig } from './AuthSocialLogin';
import { AuthFormFields } from './AuthFormFields';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';

type AuthLabelKey = Extract<LibraryTextKey, `auth${string}`>;

interface AuthFormProps {
    branding?: {
        name: string;
        logo?: string;
    };
    isRegistering: boolean;
    allowRegistration: boolean;
    labels?: Partial<Record<AuthLabelKey, string>>;
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
    errorVariant: 'error' | 'warning';
    isPending?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onSocialLogin?: (provider: string) => void;
    socialConfig?: SarakSocialConfig;
    onForgot?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    branding,
    isRegistering,
    allowRegistration,
    labels,
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
    errorVariant,
    isPending,
    onSubmit,
    onSocialLogin,
    socialConfig,
    onForgot,
}) => {
    const { getFlexStyles } = useStructuralStyles();
    const text = useLibraryText();
    const authText = (key: AuthLabelKey): string => labels?.[key] ?? text(key);
    
    return (
        <div className="w-full lg:w-2/5 flex items-center justify-center bg-theme-body border-l border-[var(--border-color,#334155)]-border shadow-[-20px_0_50px_rgba(0,0,0,0.5)] relative" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px)*2.5)' }}>
            {/* Floating Elements in Background */}
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-theme-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl animate-pulse [animation-delay:3s]"></div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <div className="block lg:hidden text-center" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*2.5)' }}>
                    <div className="mx-auto w-16 h-16 bg-theme-primary rounded-2xl flex items-center justify-center shadow-lg" style={{ marginBottom: 'var(--sarak-layout-gap-md,16px)' }}>
                        {branding?.logo ? (
                            <img src={branding.logo} alt="Logo" className="w-8 h-8 object-contain" />
                        ) : (
                            <SarakIcon name="Cpu" className="w-8 h-8 text-theme-title" />
                        )}
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-theme-title uppercase italic">{branding?.name}</h2>
                </div>

                <div style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px)*2)' }}>
                    <h3 className="text-3xl font-black text-theme-text tracking-tight" style={{ marginBottom: 'var(--sarak-layout-gap-sm,8px)' }}>
                        {authText(mfaStep ? 'authTitleMfa' : isRegistering ? 'authTitleRegister' : 'authTitleLogin')}
                    </h3>
                    <p className="text-theme-muted font-medium">
                        {authText(mfaStep ? 'authDescriptionMfa' : isRegistering ? 'authDescriptionRegister' : 'authDescriptionLogin')}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className={`border rounded-xl flex items-center text-sm font-medium shadow-lg transition-all ${
                                errorVariant === 'warning'
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}
                            style={{ gap: 'var(--sarak-layout-gap-sm,8px)', padding: 'var(--sarak-layout-gap-md,16px)', marginBottom: 'var(--sarak-layout-gap-lg,24px)' }}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${errorVariant === 'warning' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-red-500"}`}></div>
                            <span className="flex-1">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={onSubmit} className={getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)').className} style={getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-md,16px)').style}>
                    <AuthFormFields
                        mfaStep={mfaStep}
                        isRegistering={isRegistering}
                        labels={labels}
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

                {allowRegistration && <div className="border-t border-[var(--border-color,#334155)] text-center" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px)*2.5)', paddingTop: 'calc(var(--sarak-layout-gap-md,16px)*2)' }}>
                    <p className="text-theme-muted text-sm font-medium">
                        {authText(isRegistering ? 'authHasAccount' : 'authNoAccount')}
                        <SarakButton 
                            onClick={() => setIsRegistering(!isRegistering)}
                            variant="ghost"
                            className="text-theme-primary font-bold hover:underline h-auto"
                            style={{ marginLeft: 'calc(var(--sarak-layout-gap-md,16px)*0.25)', padding: 0 }}
                        >
                            {authText(isRegistering ? 'authToggleLogin' : 'authToggleRegister')}
                        </SarakButton>
                    </p>
                </div>}
            </motion.div>
        </div>
    );
};
