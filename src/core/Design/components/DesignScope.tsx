import React from 'react';
import { useDesignVariables } from '../hooks/useDesignVariables';
import { DesignOverrideContext } from '../../Provider/SarakUIProvider';

interface DesignScopeProps {
    design: any;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * DesignScope (v12.0)
 * 
 * Envolve um conteúdo em um escopo isolado de variáveis CSS de design.
 * Agora injeta também um DesignOverrideContext para que componentes que usam
 * useSarakUI() dentro deste escopo consumam o design correto (rascunho).
 */
export const DesignScope: React.FC<DesignScopeProps & Record<string, any>> = ({ 
    design, 
    children, 
    className = '', 
    style = {},
    ...rest 
}) => {
    const { variables, attributes } = useDesignVariables(design);

    // Higienização de propriedades
    const { isDesignScope, ...domSafeProps } = rest as any;

    return (
        <DesignOverrideContext.Provider value={design}>
            <div 
                className={`sarak-design-scope ${design?.mode || 'dark'} ${className}`}
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
        </DesignOverrideContext.Provider>
    );
};

