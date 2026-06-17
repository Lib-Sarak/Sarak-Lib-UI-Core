import { useMemo } from 'react';

export interface FormLayoutContext {
    wrapperClass: string;
    labelClass: string;
    inputContainerClass: string;
    iconPositionClass: string;
}

/**
 * Hook Controlador Estrutural (Camada 6) - Forms e Inputs
 * Traduz tokens estruturais em flex-direction e alinhamentos para o formulário.
 */
export const useFormLayoutStyles = (design: any): FormLayoutContext => {
    return useMemo(() => {
        const layoutDirection = design?.formLayoutDirection || 'stack';
        const iconPosition = design?.inputIconPosition || 'left';

        // 1. Container Wrapper Principal (Controla o empilhamento Label + Input)
        let wrapperClass = 'flex w-full ';
        let labelClass = 'text-sm font-medium mb-1.5 ';
        let inputContainerClass = 'relative w-full flex items-center ';

        if (layoutDirection === 'inline') {
            // Label na esquerda, input na direita
            wrapperClass += 'flex-row items-center gap-4';
            labelClass = 'text-sm font-medium whitespace-nowrap min-w-[120px] '; // remove mb
            inputContainerClass += 'flex-1';
        } else {
            // Padrão Stacked
            wrapperClass += 'flex-col';
        }

        // 2. Comportamento do ícone interno no input
        let iconPositionClass = 'absolute ';
        if (iconPosition === 'right') {
            iconPositionClass += 'right-3 ';
        } else {
            iconPositionClass += 'left-3 ';
        }

        return {
            wrapperClass: wrapperClass.trim(),
            labelClass: labelClass.trim(),
            inputContainerClass: inputContainerClass.trim(),
            iconPositionClass: iconPositionClass.trim()
        };
    }, [design?.formLayoutDirection, design?.inputIconPosition]);
};
