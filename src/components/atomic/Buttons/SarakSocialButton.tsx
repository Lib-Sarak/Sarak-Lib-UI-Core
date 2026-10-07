import React from 'react';
import { clsx } from 'clsx';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton } from './SarakButton';

type ClassValue = string | false | null | undefined;

function cn(...inputs: ClassValue[]): string {
    return mergeSarakClasses(clsx(inputs));
}

export interface SarakSocialButtonProps {
    /** Provedor usado no rótulo e callback. */
    provider: string;
    /** Elemento de marca fornecido pelo consumidor. */
    icon: React.ReactNode;
    /** Acabamento visual fornecido pelo consumidor. */
    variant: 'glass' | 'solid';
    /** Recebe o provedor clicado; omitido, o botão não executa ação. */
    onClick?: (provider: string) => void;
    /** Substitui o rótulo e o título acessível; omitido, usa o texto padrão. */
    label?: string;
    /** Esconde o texto e mantém o título acessível. */
    hideLabel?: boolean;
    /** Acrescenta classes com resolução de conflitos Tailwind. */
    className?: string;
}

export type SarakSocialProviderId = SarakSocialButtonProps['provider'];

function getButtonClasses(
    variant: SarakSocialButtonProps['variant'],
    designVariant: string,
    hideLabel: boolean,
    className?: string,
): string {
    return cn(
        'flex items-center transition-sarak group/soc active:scale-[0.97] normal-case tracking-normal font-normal',
        'bg-[var(--color-theme-card,rgba(255,255,255,0.03))]',
        'text-[var(--color-theme-text,rgba(255,255,255,0.5))]',
        'border border-white/5 hover:border-white/10',
        hideLabel ? 'w-12 h-12 justify-center' : 'w-full justify-start',
        variant === 'solid' || designVariant === 'solid'
            ? 'shadow-xl shadow-[var(--sarak-primary-color,#3b82f6)]/20 hover:shadow-[var(--sarak-primary-color,#3b82f6)]/40 hover:-translate-y-0.5'
            : 'hover:bg-white/[0.08] hover:text-theme-title',
        className,
    );
}

function getButtonStyle(hideLabel: boolean): React.CSSProperties {
    return {
        borderRadius: 'var(--radius-btn, 12px)',
        ...(hideLabel ? {} : {
            gap: 'var(--sarak-layout-gap-md, 16px)',
            paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.875)',
            paddingInline: 'var(--sarak-layout-gap-lg, 24px)',
        }),
    };
}

interface SocialButtonIconProps {
    icon: React.ReactNode;
    hideLabel: boolean;
    variant: SarakSocialButtonProps['variant'];
}

const SocialButtonIcon = ({ icon, hideLabel, variant }: SocialButtonIconProps): React.ReactElement => (
    <span
        aria-hidden="true"
        className={cn(
            'flex items-center justify-center transition-sarak',
            hideLabel ? 'w-full h-full' : 'w-8 h-8',
            variant === 'solid' ? 'bg-white/20 group-hover/soc:rotate-[10deg]' : 'bg-white/5 group-hover/soc:bg-white/10',
        )}
        style={{ borderRadius: 'calc(var(--radius-btn, 12px) * 0.8)' }}
    >
        {icon}
    </span>
);

const SocialButtonLabel = ({ label }: { label: string }): React.ReactElement => (
    <span className="font-black uppercase transition-all" style={{ fontSize: 'var(--sarak-type-scale2xs, 10px)', letterSpacing: 'var(--sarak-tracking-snug, 0.25em)' }}>
        {label}
    </span>
);

/** Botão de login social cuja marca visual pertence ao consumidor. */
export const SarakSocialButton = ({
    provider,
    icon,
    variant,
    onClick,
    label,
    hideLabel = false,
    className,
}: SarakSocialButtonProps): React.ReactElement => {
    const { design } = useSarakUI();
    const text = useLibraryText();
    const designVariant = design?.socialButtonStyle || 'glass';
    const defaultLabel = text('socialContinueWithProvider', { provider });
    const displayedLabel = label || defaultLabel;

    return (
        <SarakButton
            type="button"
            variant="ghost"
            size={hideLabel ? 'xs' : 'sm'}
            fullWidth={!hideLabel}
            onClick={() => onClick?.(provider)}
            title={displayedLabel}
            aria-label={hideLabel ? displayedLabel : undefined}
            style={getButtonStyle(hideLabel)}
            className={getButtonClasses(variant, designVariant, hideLabel, className)}
        >
            <span className={cn('flex items-center', hideLabel ? 'w-full h-full justify-center' : 'gap-[var(--sarak-layout-gap-md,16px)]')}>
                <SocialButtonIcon icon={icon} hideLabel={hideLabel} variant={variant} />
                {!hideLabel && <SocialButtonLabel label={displayedLabel} />}
            </span>
        </SarakButton>
    );
};
