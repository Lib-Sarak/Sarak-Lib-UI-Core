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
export const DesignScope: React.FC<DesignScopeProps> = ({ design, children, className = '', style = {} }) => {
    const { variables, attributes } = useDesignVariables(design);

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
        >
            {children}
        </div>
    );
};
