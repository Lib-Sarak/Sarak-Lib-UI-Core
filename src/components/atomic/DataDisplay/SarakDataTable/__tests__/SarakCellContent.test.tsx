import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SarakColumn } from '../columnModel';
import { editableCellFrame, SarakCellContent } from '../SarakCellContent';
import type { SarakCellTone } from '../SarakCellContent';

interface Row {
    score: number;
    locked?: boolean;
}

const COLUMN: SarakColumn<Row> = { id: 'score', header: 'Nota' };
const ROW: Row = { score: 3 };

describe('SarakCellContent', () => {
    it('sem tom nem edição, é só o valor', () => {
        const { container } = render(<SarakCellContent column={COLUMN} row={ROW} rowIndex={0} />);
        expect(container.innerHTML).toBe('3');
    });

    it.each<[SarakCellTone, string, string]>([
        ['success', 'Dentro do esperado', '--sarak-status-success-color'],
        ['warning', 'Atenção', '--sarak-status-warning-color'],
        ['danger', 'Crítico', '--sarak-status-error-color'],
        ['info', 'Informação', '--sarak-status-info-color'],
    ])('tom %s não depende só de cor: token, ícone e texto', (tone, label, token) => {
        const { container } = render(<SarakCellContent column={COLUMN} row={ROW} rowIndex={0} getCellTone={() => tone} />);
        const mark = container.querySelector(`[data-cell-tone="${tone}"]`) as HTMLElement;
        expect(mark.style.color).toContain(token);
        expect(mark.querySelector('svg')).not.toBeNull();
        expect(screen.getByText(label)).toHaveClass('sr-only');
        expect(mark).toHaveTextContent('3');
    });

    it('getCellTone recebe a linha e a coluna', () => {
        const getCellTone = vi.fn(() => undefined);
        render(<SarakCellContent column={COLUMN} row={ROW} rowIndex={0} getCellTone={getCellTone} />);
        expect(getCellTone).toHaveBeenCalledWith(ROW, COLUMN);
    });

    it('edita só com a coluna editável e onCellEdit', () => {
        const editable: SarakColumn<Row> = { ...COLUMN, editable: (row) => !row.locked };
        const { rerender } = render(<SarakCellContent column={editable} row={ROW} rowIndex={0} />);
        expect(screen.queryByRole('button')).toBeNull();
        rerender(<SarakCellContent column={editable} row={{ score: 3, locked: true }} rowIndex={0} onCellEdit={vi.fn()} />);
        expect(screen.queryByRole('button')).toBeNull();
        rerender(<SarakCellContent column={editable} row={ROW} rowIndex={0} onCellEdit={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Editar Nota: 3' })).toBeInTheDocument();
    });

    it('a célula editável abre espaço para o editor, e a congelada segue fixa', () => {
        expect(editableCellFrame(COLUMN, ROW, vi.fn())).toBeNull();
        expect(editableCellFrame({ ...COLUMN, editable: true }, ROW, undefined)).toBeNull();
        expect(editableCellFrame({ ...COLUMN, editable: true }, ROW, vi.fn())).toEqual({ overflow: 'visible', position: 'relative' });
        expect(editableCellFrame({ ...COLUMN, editable: true, pinned: 'left' }, ROW, vi.fn())?.position).toBe('sticky');
    });
});
