import React from 'react';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

export interface SarakFormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    /** Espaçamento entre label e campo — token semântico (`spacing-md`) ou CSS válido. */
    gap?: string;
}

/**
 * Componente Atômico de Agrupamento de Formulários.
 * O SarakFormGroup envelopa Labels e Inputs, lendo as propriedades de
 * "Form Label Position" e "Form Density" do Design Engine para rearranjar
 * a estrutura sem que o desenvolvedor altere o JSX.
 */
export const SarakFormGroup: React.FC<SarakFormGroupProps> = ({ children, className = '', style, gap, ...props }) => {
    const { getFormGroupStyles } = useStructuralStyles();
    const structuralStyles = getFormGroupStyles(gap);

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
