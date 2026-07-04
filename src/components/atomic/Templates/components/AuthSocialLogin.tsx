import React from 'react';
import { SocialButton } from '../../Atoms/SocialButton';
import { useStructuralStyles } from '../../hooks/useStructuralStyles';

interface AuthSocialLoginProps {
    socialConfig?: {
        enabled: boolean;
        display: 'compact' | 'full';
        providers: Array<{ id: string; variant: 'glass' | 'sovereign' }>;
    };
    onSocialLogin?: (provider: string) => void;
}

export const AuthSocialLogin: React.FC<AuthSocialLoginProps> = ({ socialConfig, onSocialLogin }) => {
    const { getFlexStyles, getGridStyles } = useStructuralStyles();

    if (!socialConfig?.enabled) return null;

    return (
        <div className={getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-lg,24px)').className} style={{ ...getFlexStyles('column', 'flex-start', 'stretch', 'var(--sarak-layout-gap-lg,24px)').style, marginTop: 'calc(var(--sarak-layout-gap-md,16px)*2)' }}>
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative bg-theme-body font-black text-theme-muted uppercase" style={{ paddingLeft: 'var(--sarak-layout-gap-md,16px)', paddingRight: 'var(--sarak-layout-gap-md,16px)', fontSize: 'var(--sarak-type-scale-tiny, 8px)', letterSpacing: 'var(--sarak-tracking-wide, 0.3em)' }}>Ou continue com</span>
            </div>

            <div className={getGridStyles(socialConfig.display === 'compact' ? 'repeat(4, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-sm,8px)').className} style={getGridStyles(socialConfig.display === 'compact' ? 'repeat(4, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))', undefined, 'var(--sarak-layout-gap-sm,8px)').style}>
                {socialConfig.providers.map((p) => (
                    <SocialButton 
                        key={p.id} 
                        provider={p.id as React.ComponentProps<typeof SocialButton>['provider']} 
                        variant={p.variant} 
                        hideLabel={socialConfig.display === 'compact'}
                        onClick={() => onSocialLogin?.(p.id)} 
                    />
                ))}
            </div>
        </div>
    );
};
