import React from 'react';
import { SarakSocialButton } from '../../Buttons/SarakSocialButton';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

export interface SarakSocialProviderConfig {
    id: string;
    icon: React.ReactNode;
    variant: 'glass' | 'solid';
    label?: string;
}

export interface SarakSocialConfig {
    enabled: boolean;
    display: 'compact' | 'full';
    providers: SarakSocialProviderConfig[];
}

interface AuthSocialLoginProps {
    socialConfig?: SarakSocialConfig;
    onSocialLogin?: (provider: string) => void;
}

export const AuthSocialLogin: React.FC<AuthSocialLoginProps> = ({ socialConfig, onSocialLogin }) => {
    const { getFlexStyles, getGridStyles } = useStructuralStyles();
    const text = useLibraryText();

    if (!socialConfig?.enabled) return null;

    // plan-41: `@container` plantado na raiz — o grid de provedores abaixo usa
    // `getGridStyles` (classe `@min-[…]`, container query), que precisa de um
    // ancestral com `container-type` para casar.
    return (
        <div className={`@container ${getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-lg,24px)').className}`} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-lg,24px)').style, marginTop: 'calc(var(--sarak-layout-gap-md,16px)*2)' }}>
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative bg-theme-body font-black text-theme-muted uppercase" style={{ paddingLeft: 'var(--sarak-layout-gap-md,16px)', paddingRight: 'var(--sarak-layout-gap-md,16px)', fontSize: 'var(--sarak-type-scale-tiny, 8px)', letterSpacing: 'var(--sarak-tracking-wide, 0.3em)' }}>{text('authSocialDivider')}</span>
            </div>

            <div className={getGridStyles(socialConfig.display === 'compact' ? 'repeat(4, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-sm,8px)').className} style={getGridStyles(socialConfig.display === 'compact' ? 'repeat(4, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-sm,8px)').style}>
                {socialConfig.providers.map((p) => (
                    <SarakSocialButton
                        key={p.id} 
                        provider={p.id}
                        icon={p.icon}
                        variant={p.variant} 
                        label={p.label}
                        hideLabel={socialConfig.display === 'compact'}
                        onClick={() => onSocialLogin?.(p.id)} 
                    />
                ))}
            </div>
        </div>
    );
};
