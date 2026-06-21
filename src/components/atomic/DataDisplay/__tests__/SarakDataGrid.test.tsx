import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakDataGridImpl } from '../SarakDataGrid';

describe('Spec 12 (base) — SarakDataGrid virtualizado (Regra 1)', () => {
    it('deve montar apenas uma janela de linhas, não as 10.000 (windowing)', () => {
        const { container } = render(
            <div style={{ height: 400 }}>
                <SarakDataGridImpl
                    count={10000}
                    estimateSize={40}
                    renderRow={(index) => <span data-row>{`linha-${index}`}</span>}
                />
            </div>,
        );

        const mounted = container.querySelectorAll('[data-index]');
        // Windowing: muito menos nós do que o total de linhas.
        expect(mounted.length).toBeLessThan(200);
        expect(mounted.length).toBeLessThan(10000);
    });

    it('deve reservar a altura total do scroll (count * estimateSize)', () => {
        const { container } = render(
            <SarakDataGridImpl count={100} estimateSize={50} renderRow={() => <span />} />,
        );
        const grid = container.querySelector('[data-sarak-datagrid="true"]');
        expect(grid).not.toBeNull();
        const spacer = grid?.firstElementChild as HTMLElement;
        // 100 linhas * 50px = 5000px de área virtual reservada.
        expect(spacer.style.height).toBe('5000px');
    });
});
