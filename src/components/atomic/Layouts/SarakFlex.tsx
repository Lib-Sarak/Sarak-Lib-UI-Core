import React from 'react';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
import { sarakResolveResponsiveValue } from '../../../core/Design/resolveResponsiveValue';
import type { SarakResponsiveValue } from '../../../core/Design/types';
import type { SarakLayoutGap } from '../../../core/Design/resolveToken';
import { resolveAxisGaps } from '../hooks/useStructuralStyles.gap';

export type SarakFlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse' | string;

export interface SarakFlexProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: React.ReactNode;
    /** Direção do eixo. Aceita `SarakResponsiveValue` para variar por dispositivo (opcional). */
    direction?: SarakFlexDirection | SarakResponsiveValue<SarakFlexDirection>;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | string;
    align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | string;
    gap?: SarakLayoutGap;
    /** Espaço entre linhas (quando `wrap` quebra); vence `gap` nesse eixo. */
    rowGap?: SarakLayoutGap;
    /** Espaço entre colunas; vence `gap` nesse eixo. */
    columnGap?: SarakLayoutGap;
    /**
     * Quebra em múltiplas linhas quando não cabe (mobile-first). Default `true`: uma linha de
     * itens nunca estoura a página no celular — reflui para baixo. Passe `false` para forçar
     * linha única (nowrap) quando o layout exigir.
     */
    wrap?: boolean;
    as?: React.ElementType;
}

/**
 * Componente Atômico de Micro-Layout (Flexbox).
 * O SarakFlex é um container flexível que lê os estilos estruturais do Design Engine
 * ou aceita injeção local de parâmetros, traduzindo-os sem depender de classes CSS hardcoded.
 *
 * Multidispositivo por padrão (Spec 40.3 — L2): `wrap` liga por padrão (itens quebram em vez
 * de transbordar no celular) e `direction` aceita `ResponsiveValue` para controle opcional.
 */
export const SarakFlex: React.FC<SarakFlexProps> = ({
    children,
    className = '',
    style,
    direction,
    justify,
    align,
    gap,
    rowGap,
    columnGap,
    wrap = true,
    as: Component = 'div',
    ...props
}) => {
    const { getFlexStyles } = useStructuralStyles();
    const device = useSarakDevice();

    const resolvedDirection = direction === undefined ? undefined : sarakResolveResponsiveValue(direction, device);
    const flexStyles = getFlexStyles(resolvedDirection, justify, align, gap);

    return (
        <Component
            className={`${flexStyles.className} ${className}`.trim()}
            style={{ ...flexStyles.style, ...resolveAxisGaps(rowGap, columnGap, 'SarakFlex'), flexWrap: wrap ? 'wrap' : 'nowrap', ...style }}
            {...props}
        >
            {children}
        </Component>
    );
};
