import React from 'react';
import { useDesignVariables } from '../hooks/useDesignVariables';

interface DesignScopeProps {
    design: any;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * DesignScope (v11.1)
 * 
 * Envolve um conteúdo em um escopo isolado de variáveis CSS de design.
 * Essencial para Previews (Gêmeo Digital, Preset Cards) para garantir fidelidade total
 * sem afetar o estilo global da aplicação.
 */
export const DesignScope: React.FC<DesignScopeProps & Record<string, any>> = ({ 
    design, 
    children, 
    className = '', 
    style = {},
    ...rest 
}) => {
    const { variables, attributes } = useDesignVariables(design);

    // Higienização de propriedades para evitar erros de "isDesignScope" ou similares no DOM
    const { isDesignScope, ...domSafeProps } = rest as any;

    return (
        <div 
            className={`sarak-design-scope ${className}`}
            style={{ 
                ...variables, 
                ...style,
                position: 'relative',
                width: '100%',
                height: '100%'
            }}
            {...attributes}
            {...domSafeProps}
        >
            {children}
        </div>
    );
};

