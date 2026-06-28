import { useMemo } from 'react';
import { SarakThemePayload } from '../../../../core/Provider/types';

export interface ModalLayoutContext {
    headerClass: string;
    footerClass: string;
    closeButtonClass: string;
}

const headerStylesMap: Record<string, { h: string, c: string }> = {
    'stacked': { h: 'flex-col-reverse items-start gap-2', c: 'top-4 right-4 ' },
    'floating': { h: 'justify-start items-center', c: '-top-10 -right-10 text-white ' },
    'inline': { h: 'justify-between items-center', c: 'top-4 right-4 ' }
};

const footerStylesMap: Record<string, string> = {
    'center': 'justify-center',
    'left': 'justify-start',
    'stretch': 'flex-col sm:flex-row justify-between [&>*]:flex-1',
    'right': 'justify-end'
};

/**
 * Hook Controlador Estrutural (Camada 6) - Modals
 */
export const useModalLayoutStyles = (design: SarakThemePayload): ModalLayoutContext => {
    return useMemo(() => {
        const actionAlignment = design?.modalActionAlignment || 'right';
        const headerStyle = design?.modalHeaderStyle || 'inline';

        const hConfig = headerStylesMap[headerStyle] || headerStylesMap['inline'];
        const headerClass = `flex w-full mb-4 ${hConfig.h}`;
        const closeButtonClass = `absolute ${hConfig.c}`;

        const fClass = footerStylesMap[actionAlignment] || footerStylesMap['right'];
        const footerClass = `flex w-full mt-6 gap-3 ${fClass}`;

        return {
            headerClass: headerClass.trim(),
            footerClass: footerClass.trim(),
            closeButtonClass: closeButtonClass.trim()
        };
    }, [design?.modalActionAlignment, design?.modalHeaderStyle]);
};
