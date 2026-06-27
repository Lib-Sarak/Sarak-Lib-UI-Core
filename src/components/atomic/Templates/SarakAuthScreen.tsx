import React from 'react';
import { AuthHero } from './components/AuthHero';
import { AuthForm } from './components/AuthForm';

export interface SarakAuthScreenProps {
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
export const SarakAuthScreen: React.FC<SarakAuthScreenProps> = (props) => {
    return (
        <div className="min-h-screen w-full flex bg-theme-body text-theme-text selection:bg-theme-primary/30 font-sans overflow-hidden">
            <AuthHero branding={props.branding} />
            <AuthForm {...props} />
        </div>
    );
};
