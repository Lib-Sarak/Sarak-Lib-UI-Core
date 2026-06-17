import { useMemo } from 'react';

export interface TableLayoutContext {
    tableWrapperClass: string;
    cellDensityClass: string;
    actionColumnAlignmentClass: string;
}

/**
 * Hook Controlador Estrutural (Camada 6) - Tabelas e Lists
 */
export const useTableLayoutStyles = (design: any): TableLayoutContext => {
    return useMemo(() => {
        const density = design?.tableDensity || 'comfortable';
        const actionPosition = design?.tableActionPosition || 'right';

        let cellDensityClass = 'py-3 px-4 '; // comfortable default
        
        if (density === 'compact') {
            cellDensityClass = 'py-1.5 px-2 text-sm ';
        } else if (density === 'spacious') {
            cellDensityClass = 'py-5 px-6 ';
        }

        // Se action for na esquerda, a tabela precisará tratar a ordem das colunas lógicas no componente
        // O Hook provê as classes utilitárias para alinhamento dentro da célula
        let actionColumnAlignmentClass = 'text-right justify-end ';
        if (actionPosition === 'left') {
            actionColumnAlignmentClass = 'text-left justify-start ';
        }

        return {
            tableWrapperClass: 'w-full overflow-x-auto',
            cellDensityClass: cellDensityClass.trim(),
            actionColumnAlignmentClass: actionColumnAlignmentClass.trim()
        };
    }, [design?.tableDensity, design?.tableActionPosition]);
};
