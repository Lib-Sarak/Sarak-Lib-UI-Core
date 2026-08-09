import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as ComponentModule from '../SarakInput';
import { SarakInput } from '../SarakInput';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakInput', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    it('renderiza sem SarakUIProvider, com o default de borda aplicado (solid)', () => {
        expect(() => render(<SarakInput placeholder="nome" />)).not.toThrow();
        const input = screen.getByPlaceholderText('nome');
        expect(input.style.border).toContain('1px solid');
    });

    it('com SarakUIProvider, aplica o valor REAL do tema (underline) — não o default do átomo', () => {
        render(
            <SarakUIProvider config={{ inputBorderType: 'underline' }}>
                <SarakInput placeholder="nome" />
            </SarakUIProvider>,
        );
        const input = screen.getByPlaceholderText('nome');
        // 'solid' (default sem Provider) nunca toca `borderBottom`; só 'underline' toca
        // — presente aqui prova que o valor REAL do tema atravessou, não o default.
        expect(input.style.borderBottom).toContain('2px solid');
    });
});
