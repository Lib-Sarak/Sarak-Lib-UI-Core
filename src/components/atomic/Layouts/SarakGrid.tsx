import React from 'react';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

export interface SarakGridProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    templateColumns?: string;
    templateAreas?: string;
    gap?: string;
    as?: React.ElementType;
}

/**
 * Componente Atômico de Macro-Layout.
 * O SarakGrid é o container raiz que lê o Token de Layout do Design Engine
 * e organiza os componentes filhos (Cards, Tabelas, Gráficos) na malha correta.
 * Ele elimina a necessidade de chumbarmos "grid-cols-X" nas telas.
 */
export const SarakGrid: React.FC<SarakGridProps> = ({ 
    children, 
    className = '', 
    style, 
    templateColumns,
    templateAreas,
    gap,
    as: Component = 'div',
    ...props 
}) => {
    const { getGridStyles } = useStructuralStyles();
    const structuralStyles = getGridStyles(templateColumns, templateAreas, gap);

    return (
        <Component 
            className={`${structuralStyles.className} ${className}`.trim()} 
            style={{ ...structuralStyles.style, ...style }}
            {...props}
        >
            {children}
        </Component>
    );
};
