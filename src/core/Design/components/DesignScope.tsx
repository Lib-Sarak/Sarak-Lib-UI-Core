import React, { useId } from 'react';
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
    // Generate a React 18 friendly ID, stripped of colons which break CSS selectors
    const rawId = useId();
    const uniqueId = rawId ? rawId.replace(/:/g, '') : Math.random().toString(36).slice(2, 9);
    const scopeClass = `sarak-scope-${uniqueId}`;

    const { variables, attributes, responsiveCSS } = useDesignVariables(design, `.${scopeClass}`);

    // Higienização de propriedades
    const { isDesignScope, ...domSafeProps } = rest as any;

    return (
        <DesignOverrideContext.Provider value={design}>
            <div 
                className={`sarak-design-scope ${scopeClass} ${design?.mode || 'dark'} ${className}`}
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
                {/* CSS Responsivo Dinâmico com Escopo Isolado */}
                {responsiveCSS && (
                    <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
                )}

                <SarakBackgroundRenderer 
                    imageUrl={design?.globalBackgroundImageUrl}
                    opacity={design?.globalBackgroundOpacity}
                    blur={design?.globalBackgroundBlur}
                    blendMode={design?.globalBackgroundBlendMode}
                    mode={design?.mode}
                />
                {children}
            </div>
        </DesignOverrideContext.Provider>
    );
};

