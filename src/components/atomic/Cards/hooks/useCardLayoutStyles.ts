import { useMemo } from 'react';

export interface CardLayoutContext {
    containerClass: string;
    contentClass: string;
    headerClass: string;
    footerClass: string;
    alignmentClass: string;
}

const alignStrats: Record<string, { align: string; justify: string; footer: string }> = {
    'center': { align: 'items-center text-center', justify: 'justify-center', footer: 'justify-center' },
    'right': { align: 'items-end text-right', justify: 'justify-end', footer: 'justify-end' },
    'left': { align: 'items-start text-left', justify: 'justify-between', footer: 'justify-start' }
};

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
            containerClass += imagePos === 'right' ? 'flex-row-reverse ' : 'flex-row ';
        } else {
            containerClass += 'flex-col ';
        }

        // 2. Definição do Alinhamento Transversal
        const strat = alignStrats[align] || alignStrats['left'];
        const alignmentClass = strat.align;
        const justifyClass = strat.justify;
        const footerAlign = strat.footer;

        // 3. Montagem das classes por subcomponente
        return {
            containerClass: containerClass.trim(),
            contentClass: `relative z-10 flex flex-1 w-full ${direction === 'row' ? 'flex-row' : 'flex-col h-full'} ${justifyClass} ${alignmentClass}`.trim(),
            headerClass: `flex w-full mb-4 ${direction === 'row' ? 'flex-col gap-2' : 'justify-between items-start'}`,
            footerClass: `flex gap-2 w-full mt-auto ${footerAlign}`,
            alignmentClass
        };
    }, [design?.cardLayoutDirection, design?.cardTextAlign, design?.cardImagePosition]);
};
