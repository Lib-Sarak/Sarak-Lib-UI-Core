import React from 'react';

export type SarakTypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'mono';
export type SarakTypographyColor = 'main' | 'secondary' | 'muted';

export interface SarakTypographyProps extends React.HTMLAttributes<HTMLElement> {
    /** Escala tipográfica (Spec typography — tokens `h1Size`/`h2Size`/etc). Default: `body`. */
    variant?: SarakTypographyVariant;
    /** Cor de texto (`textColorMaster`/`textColorSecondary`/`textColorMuted`). Default: `main`. */
    color?: SarakTypographyColor;
    /** Tag HTML a renderizar; sobrepõe o default semântico do `variant`. */
    as?: React.ElementType;
    /** Sobrepõe `--sarak-h-transform` só para esta instância. */
    transform?: 'none' | 'uppercase' | 'capitalize';
    /**
     * Texto via prop (string), pensado para uso via manifesto (Spec 22/24): o motor
     * de Manifesto só entrega `children` como nós filhos aninhados, nunca como string
     * crua — `content` é o canal de texto que `props.content` (com interpolação
     * `{{...}}` já resolvida em `LeafNode`) alimenta. Tem prioridade sobre `children`
     * quando ambos são passados.
     */
    content?: string;
    children?: React.ReactNode;
}

const DEFAULT_TAG: Record<SarakTypographyVariant, React.ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    body: 'p',
    caption: 'span',
    mono: 'code',
};

/** Estilo por variante — 100% via `var(--token, fallback)` (Zero Hardcode). */
const variantStyle: Record<SarakTypographyVariant, React.CSSProperties> = {
    h1: {
        fontFamily: 'var(--font-heading, var(--sarak-font-h, "Outfit", sans-serif))',
        fontSize: 'var(--sarak-h1-size, 48px)',
        fontWeight: 'var(--sarak-h1-weight, 900)',
        lineHeight: 'var(--sarak-h1-lh, 1.1)',
        letterSpacing: 'var(--sarak-h1-ls, -1px)',
    },
    h2: {
        fontFamily: 'var(--font-heading, var(--sarak-font-h, "Outfit", sans-serif))',
        fontSize: 'var(--sarak-h2-size, 32px)',
        fontWeight: 'var(--sarak-h2-weight, 700)',
        lineHeight: 'var(--sarak-h2-lh, 1.2)',
    },
    h3: {
        fontFamily: 'var(--font-heading, var(--sarak-font-h, "Outfit", sans-serif))',
        fontSize: 'var(--sarak-type-scale-xl, 20px)',
        fontWeight: 'var(--sarak-h2-weight, 600)',
        lineHeight: 'var(--sarak-h2-lh, 1.3)',
    },
    body: {
        fontFamily: 'var(--font-main, var(--sarak-font-b, "Inter", sans-serif))',
        fontSize: 'var(--theme-font-size-base, 14px)',
        fontWeight: 'var(--sarak-body-weight, var(--sarak-b-weight, 400))',
        lineHeight: 'var(--sarak-body-lh, var(--sarak-line-height, 1.6))',
    },
    caption: {
        fontFamily: 'var(--font-main, var(--sarak-font-b, "Inter", sans-serif))',
        fontSize: 'var(--sarak-type-scale-caption, 12px)',
        fontWeight: 'var(--sarak-body-weight, var(--sarak-b-weight, 400))',
        lineHeight: 'var(--sarak-body-lh, var(--sarak-line-height, 1.4))',
    },
    mono: {
        fontFamily: 'var(--font-mono, var(--sarak-font-m, "JetBrains Mono", monospace))',
        fontSize: 'var(--theme-font-size-base, 14px)',
        fontWeight: 'var(--sarak-body-weight, var(--sarak-b-weight, 400))',
        lineHeight: 'var(--sarak-body-lh, var(--sarak-line-height, 1.6))',
    },
};

const colorVar: Record<SarakTypographyColor, string> = {
    main: 'var(--sarak-text-main, var(--theme-title, #ffffff))',
    secondary: 'var(--sarak-text-sec, rgba(255, 255, 255, 0.7))',
    muted: 'var(--sarak-text-muted, var(--theme-muted, rgba(255, 255, 255, 0.4)))',
};

/**
 * Componente Atômico: SarakTypography (Spec typography).
 * Único átomo de texto/hierarquia tipográfica da Sarak — resolvível via manifesto
 * (`"type": "SarakTypography"`) ou uso direto em TSX. 100% orientado a tokens já
 * existentes no Design Engine (nenhum valor visual novo introduzido).
 */
export const SarakTypography: React.FC<SarakTypographyProps> = ({
    variant = 'body',
    color = 'main',
    as,
    transform,
    className = '',
    style,
    content,
    children,
    ...props
}) => {
    const Tag = as ?? DEFAULT_TAG[variant];
    const isHeading = variant === 'h1' || variant === 'h2' || variant === 'h3';

    const computedStyle: React.CSSProperties = {
        margin: 0,
        color: colorVar[color],
        textTransform: transform ?? (isHeading ? 'var(--sarak-h-transform, none)' as React.CSSProperties['textTransform'] : undefined),
        ...variantStyle[variant],
        ...style,
    };

    return (
        <Tag className={className} style={computedStyle} {...props}>
            {content ?? children}
        </Tag>
    );
};
