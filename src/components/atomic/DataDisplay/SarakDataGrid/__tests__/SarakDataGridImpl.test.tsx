import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SarakDataGridImpl from '../SarakDataGridImpl';

describe('Spec 12 (base) — SarakDataGridImpl: windowing e reserva de altura', () => {
    it('reserva a altura total (count × estimateSize) sem montar todas as linhas', () => {
        const { container } = render(
            <SarakDataGridImpl
                count={1000}
                estimateSize={44}
                height={300}
                renderRow={(i) => <span data-row>{`row-${i}`}</span>}
            />,
        );

        const grid = container.querySelector('[data-sarak-datagrid="true"]');
        expect(grid).not.toBeNull();

        // O espaçador interno reserva a altura total: 1000 × 44 = 44000px.
        const spacer = grid?.firstElementChild as HTMLElement;
        expect(spacer.style.height).toBe('44000px');

        // Windowing: monta MUITO menos que 1000 linhas no DOM real.
        const rows = container.querySelectorAll('[data-row]');
        expect(rows.length).toBeLessThan(1000);
    });

    it('só chama renderRow para índices válidos dentro de [0, count)', () => {
        const seen: number[] = [];
        render(
            <SarakDataGridImpl
                count={50}
                estimateSize={20}
                height={200}
                renderRow={(i) => {
                    seen.push(i);
                    return <span data-row>{i}</span>;
                }}
            />,
        );

        expect(seen.every((i) => i >= 0 && i < 50)).toBe(true);
    });
});
