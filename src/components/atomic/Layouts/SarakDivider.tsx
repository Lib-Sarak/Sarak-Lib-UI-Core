import React from 'react';

export type SarakDividerOrientation = 'horizontal' | 'vertical';

export interface SarakDividerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    /**
     * Direção do traço. Omitida, usa `horizontal`; no modo vertical, o contêiner acompanha a
     * altura disponível do pai.
     */
    orientation?: SarakDividerOrientation;
    /**
     * Texto exibido entre os traços e usado como nome acessível. Omitido, não há texto e o
     * separador é decorativo por padrão.
     */
    label?: string;
    /**
     * Oculta o componente da árvore acessível. Omitida, é decorativo quando `label` não existe
     * e semântico quando existe; use `false` sem rótulo apenas se também fornecer `aria-label`.
     */
    decorative?: boolean;
}

const DIVIDER_BORDER =
    'var(--sarak-border-width, 1px) solid var(--sarak-card-border-color, var(--theme-border, currentColor))';

const getDividerStyle = (
    orientation: SarakDividerOrientation,
    style?: React.CSSProperties,
): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    gap: 'var(--sarak-layout-gap-md, 16px)',
    width: orientation === 'horizontal' ? '100%' : 'max-content',
    height: orientation === 'vertical' ? '100%' : undefined,
    ...style,
});

const getDividerLineStyle = (orientation: SarakDividerOrientation): React.CSSProperties => {
    const isHorizontal = orientation === 'horizontal';
    return {
        flex: '1 1 auto',
        minWidth: isHorizontal ? 0 : undefined,
        minHeight: isHorizontal ? undefined : 0,
        borderBlockStart: isHorizontal ? DIVIDER_BORDER : undefined,
        borderInlineStart: isHorizontal ? undefined : DIVIDER_BORDER,
    };
};

const DIVIDER_LABEL_STYLE: React.CSSProperties = {
    color: 'var(--sarak-text-muted, var(--theme-muted, currentColor))',
    fontSize: 'var(--sarak-type-scale-xs, 11px)',
    whiteSpace: 'nowrap',
};

export const SarakDivider = ({
    orientation = 'horizontal',
    label,
    decorative,
    className,
    style,
    'aria-label': ariaLabel,
    ...props
}: SarakDividerProps): React.ReactElement => {
    const isDecorative = decorative ?? !label;
    const lineStyle = getDividerLineStyle(orientation);

    return (
        <div
            {...props}
            className={className}
            style={getDividerStyle(orientation, style)}
            role={isDecorative ? undefined : 'separator'}
            aria-orientation={isDecorative ? undefined : orientation}
            aria-label={isDecorative ? undefined : ariaLabel ?? label}
            aria-hidden={isDecorative || undefined}
        >
            <span aria-hidden="true" style={lineStyle} />
            {label ? <span style={DIVIDER_LABEL_STYLE}>{label}</span> : null}
            <span aria-hidden="true" style={lineStyle} />
        </div>
    );
};
