import { useMemo } from 'react';
import { SarakThemePayload } from '../../../../core/Provider/types';

export interface TableLayoutContext {
    tableWrapperClass: string;
    cellDensityClass: string;
}

// O respiro horizontal da célula é o do token (`--sarak-table-padding`, que o `tableCellPadding` escreve em px, padrão 12 no desktop);
// a densidade continua dona do respiro vertical e do corpo do texto.
const densityMap: Record<string, string> = {
    'compact': 'py-1.5 px-[var(--sarak-table-padding,12px)] text-sm',
    'spacious': 'py-5 px-[var(--sarak-table-padding,12px)]',
    'comfortable': 'py-3 px-[var(--sarak-table-padding,12px)]'
};

/**
 * Hook Controlador Estrutural (Camada 6) - Tables
 */
export const useTableLayoutStyles = (design: SarakThemePayload): TableLayoutContext => {
    return useMemo(() => {
        const density = design?.tableDensity || 'comfortable';

        const cellDensityClass = densityMap[density] || densityMap['comfortable'];

        return {
            tableWrapperClass: 'w-full overflow-x-auto',
            cellDensityClass
        };
    }, [design?.tableDensity]);
};
