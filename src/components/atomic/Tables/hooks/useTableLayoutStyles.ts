import { useMemo } from 'react';
import { SarakThemePayload } from '../../../../core/Provider/types';

export interface TableLayoutContext {
    tableWrapperClass: string;
    cellDensityClass: string;
    actionColumnAlignmentClass: string;
}

const densityMap: Record<string, string> = {
    'compact': 'py-1.5 px-2 text-sm',
    'spacious': 'py-5 px-6',
    'comfortable': 'py-3 px-4'
};

const actionAlignmentMap: Record<string, string> = {
    'left': 'text-left justify-start',
    'right': 'text-right justify-end'
};

/**
 * Hook Controlador Estrutural (Camada 6) - Tables
 */
export const useTableLayoutStyles = (design: SarakThemePayload): TableLayoutContext => {
    return useMemo(() => {
        const density = design?.tableDensity || 'comfortable';
        const actionPosition = design?.tableActionPosition || 'right';

        const cellDensityClass = densityMap[density] || densityMap['comfortable'];
        const actionColumnAlignmentClass = actionAlignmentMap[actionPosition] || actionAlignmentMap['right'];

        return {
            tableWrapperClass: 'w-full overflow-x-auto',
            cellDensityClass,
            actionColumnAlignmentClass
        };
    }, [design?.tableDensity, design?.tableActionPosition]);
};
