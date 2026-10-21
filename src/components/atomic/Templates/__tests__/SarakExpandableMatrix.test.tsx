import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import SarakExpandableMatrix from '../SarakExpandableMatrix';
import * as ComponentModule from '../SarakExpandableMatrix';

describe('SarakExpandableMatrix', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('o espaço entre os sub-itens é o `--sarak-matrix-gap` (token matrixGap), com o padrão do token como reserva', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakExpandableMatrix
                    data={[{ id: 'papel', name: 'Papel' }]}
                    subItems={[{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]}
                    activeMapping={() => false}
                    onToggle={() => undefined}
                />
            </SarakUIProvider>,
        );
        fireEvent.click(screen.getByText('Papel'));
        const parentRow = container.querySelector('.sarak-card') as HTMLElement;
        const stack = Array.from(parentRow.querySelectorAll<HTMLElement>('[style*="gap"]'))
            .find((el) => el.getAttribute('style')?.includes('gap: var(--sarak-matrix-gap, 12px)'));
        expect(stack).toBeDefined();
    });

    it('o espaçamento da lista de linhas também usa matrixGap', () => {
        const { container } = render(
            <SarakExpandableMatrix
                data={[{ id: 'papel', name: 'Papel' }]}
                subItems={[]}
                activeMapping={() => false}
                onToggle={() => undefined}
            />,
        );
        const rows = (container.firstElementChild as HTMLElement).children[1] as HTMLElement;

        expect(rows.style.gap).toBe('var(--sarak-matrix-gap, 12px)');
    });
});
