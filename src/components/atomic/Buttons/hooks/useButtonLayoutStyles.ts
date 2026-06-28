import { useMemo } from 'react';
import { SarakThemePayload } from '../../../../core/Provider/types';

export interface ButtonLayoutContext {
    containerClass: string;
    iconOrderClass: string;
}

/**
 * Hook Controlador Estrutural (Camada 6) - Botões
 */
export const useButtonLayoutStyles = (design: SarakThemePayload): ButtonLayoutContext => {
    return useMemo(() => {
        const iconPosition = design?.buttonIconPosition || 'left';
        const widthStrategy = design?.buttonWidthStrategy || 'auto';

        let containerClass = 'flex justify-center items-center gap-2 ';
        
        if (widthStrategy === 'full') {
            containerClass += 'w-full ';
        } else {
            containerClass += 'w-max min-w-fit ';
        }

        // Inversão estrutural usando flex-row-reverse caso ícone deva estar na direita
        let iconOrderClass = 'flex-row ';
        if (iconPosition === 'right') {
            iconOrderClass = 'flex-row-reverse ';
        }

        return {
            containerClass: containerClass.trim(),
            iconOrderClass: iconOrderClass.trim()
        };
    }, [design?.buttonIconPosition, design?.buttonWidthStrategy]);
};
