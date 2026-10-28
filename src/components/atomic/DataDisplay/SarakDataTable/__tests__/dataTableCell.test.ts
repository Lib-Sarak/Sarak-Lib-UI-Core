import { describe, expect, it } from 'vitest';
import { SELECTION_COLUMN_WIDTH } from '../columnModel';
import { dataCellStyle, EXPANDER_WIDTH, leadingWidthOf } from '../dataTableCell';

const layout = { automaticHeight: false, offsets: { left: { id: 0 }, right: {}, total: 100 }, cellBackground: 'white', selectable: false, hasExpander: false };

describe('dataTableCell', () => {
    it('soma só as colunas de serviço presentes', () => {
        expect(leadingWidthOf({ selectable: false })).toBe(0);
        expect(leadingWidthOf({ selectable: true })).toBe(SELECTION_COLUMN_WIDTH);
        expect(leadingWidthOf({ selectable: true, hasExpander: true })).toBe(SELECTION_COLUMN_WIDTH + EXPANDER_WIDTH);
    });

    it('célula numérica com formato: direita e tabular-nums', () => {
        const style = dataCellStyle({ id: 'amount', header: 'x', format: { type: 'number' } }, 90, layout);
        expect(style).toMatchObject({ width: 90, justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums' });
    });

    it('o alinhamento declarado vence e coluna sem formato não usa tabular-nums', () => {
        const style = dataCellStyle({ id: 'a', header: 'x', align: 'center' }, 50, layout);
        expect(style.justifyContent).toBe('center');
        expect(style.fontVariantNumeric).toBeUndefined();
    });

    it('coluna congelada à esquerda recua pelas colunas de serviço', () => {
        const style = dataCellStyle({ id: 'id', header: 'x', pinned: 'left' }, 50, { ...layout, selectable: true, hasExpander: true });
        expect(style).toMatchObject({ position: 'sticky', left: SELECTION_COLUMN_WIDTH + EXPANDER_WIDTH });
    });

    it('altura automática libera o transbordo e a quebra de linha', () => {
        const style = dataCellStyle({ id: 'a', header: 'x' }, 50, { ...layout, automaticHeight: true });
        expect(style).toMatchObject({ overflow: 'visible', whiteSpace: 'normal' });
    });
});
