import React from 'react';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useSarakDevice } from '../../../core/Provider/DeviceProvider';
import { resolveResponsiveValue } from '../../../core/Design/resolveResponsiveValue';
import type { ResponsiveValue } from '../../../core/Design/types';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse' | string;

export interface SarakFlexProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    children: React.ReactNode;
    /** Direção do eixo. Aceita `ResponsiveValue` para variar por dispositivo (opcional). */
    direction?: FlexDirection | ResponsiveValue<FlexDirection>;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | string;
    align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | string;
    gap?: string;
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
    wrap = true,
    as: Component = 'div',
    ...props
}) => {
    const { getFlexStyles } = useStructuralStyles();
    const device = useSarakDevice();

    const resolvedDirection = direction === undefined ? undefined : resolveResponsiveValue(direction, device);
    const flexStyles = getFlexStyles(resolvedDirection, justify, align, gap);

    return (
        <Component
            className={`${flexStyles.className} ${className}`.trim()}
            style={{ ...flexStyles.style, flexWrap: wrap ? 'wrap' : 'nowrap', ...style }}
            {...props}
        >
            {children}
        </Component>
    );
};
