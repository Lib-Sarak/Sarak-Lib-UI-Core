import React from 'react';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

export interface SarakFlexProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | string;
    justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | string;
    align?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | string;
    gap?: string;
    as?: React.ElementType;
}

/**
 * Componente Atômico de Micro-Layout (Flexbox).
 * O SarakFlex é um container flexível que lê os estilos estruturais do Design Engine
 * ou aceita injeção local de parâmetros, traduzindo-os sem depender de classes CSS hardcoded.
 */
export const SarakFlex: React.FC<SarakFlexProps> = ({ 
    children, 
    className = '', 
    style,
    direction,
    justify,
    align,
    gap,
    as: Component = 'div',
    ...props 
}) => {
    const { getFlexStyles } = useStructuralStyles();
    const flexStyles = getFlexStyles(direction, justify, align, gap);

    return (
        <Component 
            className={`${flexStyles.className} ${className}`.trim()} 
            style={{ ...flexStyles.style, ...style }}
            {...props}
        >
            {children}
        </Component>
    );
};
