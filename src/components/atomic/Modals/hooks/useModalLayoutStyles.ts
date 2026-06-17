import { useMemo } from 'react';

export interface ModalLayoutContext {
    headerClass: string;
    footerClass: string;
    closeButtonClass: string;
}

/**
 * Hook Controlador Estrutural (Camada 6) - Modais
 * Define como o Header (e botão de fechar) e o Footer (alinhamento de ações) se comportam.
 */
export const useModalLayoutStyles = (design: any): ModalLayoutContext => {
    return useMemo(() => {
        const actionAlignment = design?.modalActionAlignment || 'right';
        const headerStyle = design?.modalHeaderStyle || 'inline';

        // 1. Estilo do Cabeçalho e Botão Fechar
        let headerClass = 'flex w-full mb-4 ';
        let closeButtonClass = 'absolute ';

        if (headerStyle === 'stacked') {
            headerClass += 'flex-col-reverse items-start gap-2';
            closeButtonClass += 'top-4 right-4 ';
        } else if (headerStyle === 'floating') {
            headerClass += 'justify-start items-center';
            // Botão vaza para fora do container do modal (útil para imagens/galerias)
            closeButtonClass += '-top-10 -right-10 text-white ';
        } else {
            // Padrão Inline
            headerClass += 'justify-between items-center';
            closeButtonClass += 'top-4 right-4 ';
        }

        // 2. Alinhamento de Ações no Footer
        let footerClass = 'flex w-full mt-6 gap-3 ';
        
        if (actionAlignment === 'center') {
            footerClass += 'justify-center';
        } else if (actionAlignment === 'left') {
            footerClass += 'justify-start';
        } else if (actionAlignment === 'stretch') {
            footerClass += 'flex-col sm:flex-row justify-between [&>*]:flex-1';
        } else {
            // Padrão Right
            footerClass += 'justify-end';
        }

        return {
            headerClass: headerClass.trim(),
            footerClass: footerClass.trim(),
            closeButtonClass: closeButtonClass.trim()
        };
    }, [design?.modalActionAlignment, design?.modalHeaderStyle]);
};
