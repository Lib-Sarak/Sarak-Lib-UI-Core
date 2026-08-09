import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakButton';
import { SarakButton } from '../SarakButton';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakButton', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    it('renderiza sem SarakUIProvider, com o default de estilo aplicado (matte)', () => {
        expect(() => render(<SarakButton>Salvar</SarakButton>)).not.toThrow();
        const button = screen.getByRole('button', { name: 'Salvar' });
        expect(button.className).toContain('shadow-xl');
    });

    it('com SarakUIProvider, aplica o valor REAL do tema (neon) — não o default do átomo', () => {
        render(
            <SarakUIProvider config={{ btnStyleType: 'neon' }}>
                <SarakButton>Salvar</SarakButton>
            </SarakUIProvider>,
        );
        const button = screen.getByRole('button', { name: 'Salvar' });
        // 'matte' é o único styleType que adiciona shadow-xl (SarakButton.tsx:53); neon
        // real chegando prova que a leniência do átomo não vazou para o caminho com Provider.
        expect(button.className).not.toContain('shadow-xl');
        expect(button.style.border).toContain('1px solid');
    });
});
