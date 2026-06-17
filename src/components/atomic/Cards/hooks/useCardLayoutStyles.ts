import { useMemo } from 'react';

export interface CardLayoutContext {
    containerClass: string;
    contentClass: string;
    headerClass: string;
    footerClass: string;
    alignmentClass: string;
}

/**
 * Hook Controlador Estrutural (Camada 6)
 * Traduz tokens de layout (Direção, Posição de Imagem, Alinhamento) em classes Tailwind.
 * Mantém o JSX limpo e isento de lógica de decisão.
 */
export const useCardLayoutStyles = (design: any): CardLayoutContext => {
    return useMemo(() => {
        const direction = design?.cardLayoutDirection || 'column';
        const align = design?.cardTextAlign || 'left';
        const imagePos = design?.cardImagePosition || 'none';

        // 1. Definição do Container Principal
        let containerClass = 'flex ';
        if (direction === 'row') {
            // Se imagePos for right, inverte o row
            if (imagePos === 'right') {
                containerClass += 'flex-row-reverse ';
            } else {
                containerClass += 'flex-row ';
            }
        } else {
            containerClass += 'flex-col ';
        }

        // 2. Definição do Alinhamento Transversal
        let alignmentClass = 'items-start text-left';
        let justifyClass = 'justify-between';
        
        if (align === 'center') {
            alignmentClass = 'items-center text-center';
            justifyClass = 'justify-center';
        } else if (align === 'right') {
            alignmentClass = 'items-end text-right';
            justifyClass = 'justify-end';
        }

        // 3. Montagem das classes por subcomponente
        return {
            containerClass: containerClass.trim(),
            contentClass: `relative z-10 flex flex-1 w-full ${direction === 'row' ? 'flex-row' : 'flex-col h-full'} ${justifyClass} ${alignmentClass}`.trim(),
            headerClass: `flex w-full mb-4 ${direction === 'row' ? 'flex-col gap-2' : 'justify-between items-start'}`,
            footerClass: `flex gap-2 w-full mt-auto ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`,
            alignmentClass
        };
    }, [design?.cardLayoutDirection, design?.cardTextAlign, design?.cardImagePosition]);
};
