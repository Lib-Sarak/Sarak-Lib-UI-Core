import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTableLayoutStyles } from '../useTableLayoutStyles';
import { TABLE_PRESETS } from '../../../../../core/Design/presets/components/dataPresets';
import { useDesignVariables } from '../../../../../core/Design/hooks/useDesignVariables';

const cellClassOf = (tableDensity?: string): string => renderHook(() => useTableLayoutStyles({ tableDensity } as never)).result.current.cellDensityClass;

describe('useTableLayoutStyles — a densidade e o respiro horizontal da célula', () => {
    it.each([
        ['compact', 'py-1.5', 'var(--sarak-table-padding,12px)'],
        ['comfortable', 'py-3', 'var(--sarak-table-padding,12px)'],
        ['spacious', 'py-5', 'var(--sarak-table-padding,12px)'],
    ])('densidade %s: respiro vertical próprio e o horizontal vem do token', (density, vertical, horizontal) => {
        const classes = cellClassOf(density);
        expect(classes).toContain(vertical);
        expect(classes).toContain(`px-[${horizontal}]`);
    });

    it('densidade desconhecida ou ausente cai na confortável', () => {
        expect(cellClassOf('inexistente')).toBe(cellClassOf('comfortable'));
        expect(cellClassOf(undefined)).toBe(cellClassOf('comfortable'));
    });
});

describe('tableCellPadding — cada opção do grupo Tabelas escreve a variável que a célula lê', () => {
    it.each(TABLE_PRESETS.map((preset) => [preset.name, preset.design.tableCellPadding as number]))('%s: tableCellPadding %s vira --sarak-table-padding em px', (_name, padding) => {
        const { variables } = renderHook(() => useDesignVariables({ tableCellPadding: padding } as never)).result.current;
        expect(variables['--sarak-table-padding']).toBe(`${padding}px`);
    });
});
