import React from 'react';
import { SocialButton } from '../../Atoms/SocialButton';

interface AuthSocialLoginProps {
    socialConfig?: {
        enabled: boolean;
        display: 'compact' | 'full';
        providers: Array<{ id: string; variant: 'glass' | 'sovereign' }>;
    };
    onSocialLogin?: (provider: string) => void;
}

export const AuthSocialLogin: React.FC<AuthSocialLoginProps> = ({ socialConfig, onSocialLogin }) => {
    if (!socialConfig?.enabled) return null;

    return (
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
