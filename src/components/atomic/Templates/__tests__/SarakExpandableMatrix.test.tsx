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
        const stack = Array.from(container.querySelectorAll<HTMLElement>('[style*="gap"]'))
            .find((el) => el.getAttribute('style')?.includes('gap: var(--sarak-matrix-gap, 12px)'));
        expect(stack).toBeDefined();
        expect(stack?.getAttribute('style')).toContain('flex-direction: column');
    });
});
