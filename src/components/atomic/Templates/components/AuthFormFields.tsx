import React from 'react';

import { SarakIcon } from "../../Icon/SarakIcon";
import { SarakInput } from '../../Inputs';
import { SarakButton, SarakIconButton } from '../../Buttons';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';

type AuthLabelKey = Extract<LibraryTextKey, `auth${string}`>;

interface AuthFormFieldsProps {
    mfaStep: boolean;
    isRegistering: boolean;
    labels?: Partial<Record<AuthLabelKey, string>>;
    username: string;
    setUsername: (val: string) => void;
    password?: string;
    setPassword?: (val: string) => void;
    mfaCode?: string;
    setMfaCode?: (val: string) => void;
    showPassword?: boolean;
    setShowPassword?: (val: boolean) => void;
    isPending?: boolean;
    setMfaStep: (val: boolean) => void;
    onForgot?: () => void;
}

export const AuthFormFields: React.FC<AuthFormFieldsProps> = ({
    mfaStep,
    isRegistering,
    labels,
    username,
    setUsername,
    password,
    setPassword,
    mfaCode,
    setMfaCode,
    showPassword,
    setShowPassword,
    isPending,
    setMfaStep,
    onForgot
}) => {
    const { getFlexStyles } = useStructuralStyles();
    const text = useLibraryText();
    const authText = (key: AuthLabelKey): string => labels?.[key] ?? text(key);

    return (
        <>
            {!mfaStep ? (
                <>
                    <div className={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px)*0.25)').className} style={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px)*0.25)').style}>
                        <label className="text-xs font-bold text-theme-muted uppercase tracking-widest" style={{ marginLeft: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>{authText('authEmailLabel')}</label>
                        <SarakInput
                            type="email"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={authText('authEmailPlaceholder')}
                            autoComplete="username"
                            leftIcon={<SarakIcon name="User" className="h-5 w-5" />}
                            fullWidth
                        />
                    </div>

                    <div className={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px)*0.25)').className} style={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px)*0.25)').style}>
                        <div className="flex items-center justify-between" style={{ paddingLeft: 'calc(var(--sarak-layout-gap-md,16px)*0.25)', paddingRight: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>
                            <label className="text-xs font-bold text-theme-muted uppercase tracking-widest">{authText('authPasswordLabel')}</label>
                            {!isRegistering && onForgot && (
                                <SarakButton 
                                    onClick={onForgot}
                                    variant="ghost"
                                    className="text-xs font-bold text-theme-primary h-auto hover:opacity-80"
                                    style={{ padding: 0 }}
                                >
                                    {authText('authForgotPassword')}
                                </SarakButton>
                            )}
                        </div>
                        <SarakInput
                            type={showPassword ? "text" : "password"}
                            required
                            value={password || ''}
                            onChange={(e) => setPassword?.(e.target.value)}
                            placeholder="••••••••"
                            autoComplete={isRegistering ? 'new-password' : 'current-password'}
                            leftIcon={<SarakIcon name="Lock" className="h-5 w-5" />}
                            rightIcon={setShowPassword ? (
                                <SarakIconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    icon={showPassword ? <SarakIcon name="EyeOff" className="h-5 w-5" /> : <SarakIcon name="Eye" className="h-5 w-5" />}
                                    variant="ghost"
                                    className="text-[var(--sarak-input-icon-color,var(--text-muted,#94a3b8))] hover:text-theme-text"
                                    style={{ padding: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}
                                />
                            ) : undefined}
                            fullWidth
                        />
                    </div>
                </>
            ) : (
                <div className={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px)*0.25)').className} style={getFlexStyles('column', 'flex-start', 'stretch', 'calc(var(--sarak-layout-gap-md,16px)*0.25)').style}>
                    <label className="text-xs font-bold text-theme-muted uppercase tracking-widest" style={{ marginLeft: 'calc(var(--sarak-layout-gap-md,16px)*0.25)' }}>{authText('authMfaLabel')}</label>
                    <SarakInput
                        type="text"
                        required
                        maxLength={6}
                        value={mfaCode || ''}
                        onChange={(e) => setMfaCode?.(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        autoComplete="one-time-code"
                        autoFocus
                        className="text-center text-2xl"
                        style={{ letterSpacing: 'var(--sarak-tracking-widest, 0.5em)' }}
                        leftIcon={<SarakIcon name="ShieldCheck" className="h-5 w-5" />}
                        fullWidth
                    />
                    <SarakButton 
                        onClick={() => setMfaStep(false)}
                        variant="ghost"
                        className="text-xs font-bold text-theme-muted hover:text-theme-primary h-auto"
                        style={{ marginTop: 'var(--sarak-layout-gap-sm,8px)', paddingLeft: 0, paddingRight: 0 }}
                    >
                        {authText('authBackToPassword')}
                    </SarakButton>
                </div>
            )}

            <SarakButton
                type="submit"
                isLoading={isPending}
                variant="primary"
                fullWidth
                style={{ marginTop: 'var(--sarak-layout-gap-md,16px)' }}
                rightIcon={!isPending ? <SarakIcon name="ChevronRight" className="w-4 h-4" /> : undefined}
            >
                {authText(mfaStep ? 'authSubmitMfa' : isRegistering ? 'authSubmitRegister' : 'authSubmitLogin')}
            </SarakButton>
        </>
    );
};
