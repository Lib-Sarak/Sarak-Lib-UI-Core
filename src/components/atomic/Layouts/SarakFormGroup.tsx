import React from 'react';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

export interface SarakFormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

/**
 * Componente Atômico de Agrupamento de Formulários.
 * O SarakFormGroup envelopa Labels e Inputs, lendo as propriedades de
 * "Form Label Position" e "Form Density" do Design Engine para rearranjar
 * a estrutura sem que o desenvolvedor altere o JSX.
 */
export const SarakFormGroup: React.FC<SarakFormGroupProps> = ({ children, className = '', style, ...props }) => {
    const { getFormGroupStyles } = useStructuralStyles();
    const structuralStyles = getFormGroupStyles();

    return (
        <div 
            className={`${structuralStyles.className} ${className}`.trim()} 
            style={{ ...structuralStyles.style, ...style }}
            {...props}
        >
            {children}
        </div>
    );
};
