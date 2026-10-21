import { useMemo } from 'react';
import { SarakThemePayload } from '../../../../core/Provider/types';

export interface TableLayoutContext {
    tableWrapperClass: string;
    cellDensityClass: string;
}

const densityMap: Record<string, string> = {
    'compact': 'py-1.5 px-2 text-sm',
    'spacious': 'py-5 px-6',
    'comfortable': 'py-3 px-4'
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
