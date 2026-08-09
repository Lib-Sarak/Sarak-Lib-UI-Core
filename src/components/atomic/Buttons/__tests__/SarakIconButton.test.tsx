import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakIconButton';
import { SarakIconButton } from '../SarakIconButton';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakIconButton', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    it('renderiza sem SarakUIProvider, com o default de estilo aplicado (matte)', () => {
        expect(() =>
            render(<SarakIconButton icon={<span>x</span>} aria-label="ação" />),
        ).not.toThrow();
        const button = screen.getByRole('button', { name: 'ação' });
        expect(button.className).toContain('shadow-xl');
    });

    it('com SarakUIProvider, aplica o valor REAL do tema (neon) — não o default do átomo', () => {
        render(
            <SarakUIProvider config={{ btnStyleType: 'neon' }}>
                <SarakIconButton icon={<span>x</span>} aria-label="ação" />
            </SarakUIProvider>,
        );
        const button = screen.getByRole('button', { name: 'ação' });
        expect(button.className).not.toContain('shadow-xl');
        // 'matte' (default sem Provider) não toca `border`; só neon/frosted tocam — a
        // borda com a cor real de glow prova que o valor REAL do tema chegou.
        expect(button.style.border).toContain('rgba(0, 242, 255, 0.4)');
    });
});
