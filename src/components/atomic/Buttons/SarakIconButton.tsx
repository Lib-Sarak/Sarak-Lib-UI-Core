import React, { ButtonHTMLAttributes, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { neumorphismButtonShadow, resolveNeonPulseClass } from '../hooks/useAtomicStyles';

export interface SarakIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Define a aparência visual sem mudar o tipo HTML; sem a prop, usa `primary`. */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** Define a largura e a altura quadradas do botão; sem a prop, usa `md` (40 × 40 px). */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Troca o ícone pelo indicador de carregamento e desabilita o botão enquanto ativa; omitida, mantém o botão habilitado. */
    isLoading?: boolean;
    /** Elemento exibido dentro do botão; é obrigatório, e sem ele o botão não mostra um glifo; `isLoading` o substitui pelo indicador. */
    icon: React.ReactNode;
}

/**
 * Componente Atômico: SarakIconButton
 * Um botão iconográfico com restrições geométricas exatas.
 * Implementa taxonomia completa (Neon, Frosted) adaptada para proporções quadradas/circulares.
 *
 * @sarak-encapsula button — a razão de existir deste componente é encapsular o
 *   `<button>` nativo, para teclado e leitor de tela funcionarem por construção.
 */
// Borda e sombra do vidro: derivadas da cor de texto e da cor de sombra do tema, nos dois modos.
const FROSTED_EDGE = 'color-mix(in srgb, var(--text-main, #f2f6fb) 10%, transparent)';
const FROSTED_SHADOW = 'color-mix(in srgb, var(--sarak-card-shadow-color, #000000) 30%, transparent)';

export const SarakIconButton: React.FC<SarakIconButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    className = '',
    disabled,
    style,
    ...props
}) => {
    // Átomo: tolera montar sem SarakUIProvider (Spec 18 — R10 §2.3), usa o default abaixo.
    const design = useSarakUIOptional()?.design;
    const [isHovered, setIsHovered] = useState(false);

    const styleType = design?.btnStyleType || 'matte';
    // O brilho é a variável do token (`btnNeonGlowColor`): vale também sob o escopo embarcado, e o perigo
    // acende na cor de erro do tema, não num vermelho fixo.
    const glowColor = 'var(--sarak-btn-neon-glow-color, rgba(25,227,240,0.4))';
    const blurAmount = design?.btnBackdropBlur || 0;

    // Tamanhos estritamente quadrados
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg'
    };

    const baseClasses = `inline-flex items-center justify-center transition-all active:[transition-duration:var(--sarak-motion-dur-instant,0.1s)] focus:outline-none rounded-btn flex-shrink-0 ${sizeClasses[size]}`;

    // Computar cores base
    const localGlow = variant === 'danger'
        ? 'color-mix(in srgb, var(--sarak-status-error-color, #ef4444) 50%, transparent)'
        : glowColor;

    const getTailwindClasses = (v: string, st: string) => {
        const strats: Record<string, () => string> = {
            'primary': () => {
                if (st === 'borderline') return 'border border-[var(--sarak-primary-color,#19e3f0)] bg-transparent hover:bg-[var(--sarak-btn-primary-bg,#19e3f0)] hover:text-[var(--sarak-btn-primary-text,#04121a)] active:scale-[0.95] text-[var(--sarak-primary-color,#19e3f0)]';
                const base = 'bg-[var(--sarak-btn-primary-bg,#19e3f0)] text-[var(--sarak-btn-primary-text,#04121a)] hover:brightness-110 active:scale-[0.95]';
                return st === 'matte' ? `${base} shadow-xl shadow-[var(--sarak-primary-color,#19e3f0)]/20` : base;
            },
            'secondary': () => 'bg-[var(--sarak-btn-secondary-bg,rgba(255,255,255,0.05))] text-[var(--text-muted,rgba(242,246,251,0.55))] hover:bg-[var(--sarak-btn-primary-bg,#19e3f0)] hover:text-[var(--sarak-btn-primary-text,#04121a)] border border-[var(--sarak-primary-color,#19e3f0)]/20 active:scale-[0.95]',
            'ghost': () => 'bg-transparent text-[var(--sarak-primary-color,#19e3f0)] hover:bg-[var(--sarak-btn-ghost-hover,rgba(255,255,255,0.05))] hover:text-[color-mix(in_srgb,var(--sarak-primary-color,#19e3f0)_40%,var(--sarak-on-surface,#ffffff))] active:scale-[0.98]',
            'danger': () => 'bg-[var(--sarak-status-error-color,#ef4444)] text-[var(--sarak-on-error,#020617)] hover:brightness-110 shadow-lg shadow-[var(--sarak-status-error-color,#ef4444)]/20 active:scale-[0.95]'
        };
        return strats[v] ? strats[v]() : '';
    };

    const tailwindClasses = getTailwindClasses(variant, styleType);

    const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    const dynamicStyle: React.CSSProperties = { ...style };
    
    // Processamento Visual Dinâmico Reduzido para Ícones
    const applyDynamicStyles = () => {
        const neonStyles: Record<string, () => void> = {
            'primary': () => {
                dynamicStyle.boxShadow = isHovered
                    ? `0 0 var(--sarak-icon-button-glow-blur-lg, 12px) ${localGlow}, inset 0 0 var(--sarak-icon-button-glow-blur-sm, 5px) ${localGlow}`
                    : `0 0 var(--sarak-icon-button-glow-blur-sm, 5px) ${localGlow}`;
                dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${localGlow}`;
            },
            'danger': () => {
                dynamicStyle.boxShadow = isHovered
                    ? `0 0 var(--sarak-icon-button-glow-blur-lg, 12px) ${localGlow}, inset 0 0 var(--sarak-icon-button-glow-blur-sm, 5px) ${localGlow}`
                    : `0 0 var(--sarak-icon-button-glow-blur-sm, 5px) ${localGlow}`;
                dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${localGlow}`;
            },
            'secondary': () => {
                dynamicStyle.boxShadow = isHovered ? `0 0 var(--sarak-icon-button-glow-blur-md, 8px) ${localGlow}` : 'none';
                dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${localGlow}`;
                dynamicStyle.backgroundColor = 'var(--sarak-btn-secondary-bg, rgba(255, 255, 255, 0.05))';
            },
            'ghost': () => {
                dynamicStyle.boxShadow = isHovered ? `0 0 var(--sarak-icon-button-glow-blur-md, 8px) ${localGlow}` : 'none';
                if (isHovered) dynamicStyle.textShadow = `0 0 var(--sarak-icon-button-glow-blur-sm, 5px) ${localGlow}`;
            }
        };

        const frostedStyles: Record<string, () => void> = {
            'primary': () => {
                dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
                dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
                dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${FROSTED_EDGE}`;
                dynamicStyle.boxShadow = `0 var(--sarak-icon-button-frosted-shadow-offset-y, 4px) var(--sarak-icon-button-frosted-shadow-blur, 16px) 0 ${FROSTED_SHADOW}`;
            },
            'danger': () => {
                dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
                dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
                dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${FROSTED_EDGE}`;
                dynamicStyle.boxShadow = `0 var(--sarak-icon-button-frosted-shadow-offset-y, 4px) var(--sarak-icon-button-frosted-shadow-blur, 16px) 0 ${FROSTED_SHADOW}`;
            },
            'secondary': () => {
                dynamicStyle.backdropFilter = `blur(${blurAmount}px)`;
                dynamicStyle.WebkitBackdropFilter = `blur(${blurAmount}px)`;
                dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${FROSTED_EDGE}`;
                dynamicStyle.backgroundColor = 'var(--sarak-btn-secondary-bg, rgba(255, 255, 255, 0.05))';
            }
        };

        if (styleType === 'neon' && neonStyles[variant]) neonStyles[variant]();
        if (styleType === 'frosted' && frostedStyles[variant]) frostedStyles[variant]();
        if (styleType === 'neumorphism') {
            dynamicStyle.border = 'none';
            dynamicStyle.boxShadow = neumorphismButtonShadow(isHovered);
        }
        if (styleType === 'cyberpunk') {
            // Wireframe anguloso: contorno na cor do brilho, cantos retos, sem preenchimento.
            dynamicStyle.backgroundColor = 'transparent';
            dynamicStyle.border = `var(--sarak-border-width, 1px) solid ${localGlow}`;
            dynamicStyle.borderRadius = 0;
            dynamicStyle.boxShadow = isHovered ? `0 0 var(--sarak-icon-button-glow-blur-md, 8px) ${localGlow}` : 'none';
        }
    };
    
    applyDynamicStyles();

    return (
        <button
            className={mergeSarakClasses(baseClasses, tailwindClasses, resolveNeonPulseClass(design, variant), disabledClass, className)}
            disabled={disabled || isLoading}
            style={dynamicStyle}
            onMouseEnter={(e) => { setIsHovered(true); props.onMouseEnter?.(e); }}
            onMouseLeave={(e) => { setIsHovered(false); props.onMouseLeave?.(e); }}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon}
        </button>
    );
};
