import React from 'react';
import { useDesignVariables } from '../hooks/useDesignVariables';
import { DesignOverrideContext } from '../../Provider/SarakUIProvider';
import { SarakBackgroundRenderer } from './SarakBackgroundRenderer';

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
                    width: '100%',
                    height: '100%',
                    ...variables, 
                    ...style,
                    position: 'relative'
                }}
                {...attributes}
                {...domSafeProps}
            >
                <SarakBackgroundRenderer 
                    imageUrl={design?.globalBackgroundImageUrl}
                    opacity={design?.globalBackgroundOpacity}
                    blur={design?.globalBackgroundBlur}
                    blendMode={design?.globalBackgroundBlendMode}
                />
                {children}
            </div>
        </DesignOverrideContext.Provider>
    );
};

