import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as ComponentModule from '../SarakTextarea';
import { SarakTextarea } from '../SarakTextarea';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakTextarea', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('renderiza sem SarakUIProvider (R34), com o default de borda aplicado (solid), e o texto digitado chega ao onChange', () => {
        const onChange = vi.fn();
        expect(() => render(<SarakTextarea placeholder="nota" onChange={onChange} />)).not.toThrow();
        const box = screen.getByPlaceholderText('nota') as HTMLTextAreaElement;
        expect(box.style.border).toContain('1px solid');

        fireEvent.change(box, { target: { value: 'olá' } });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(box.value).toBe('olá');
    });

    it('com SarakUIProvider, aplica o valor REAL do tema (underline) — não o default do átomo', () => {
        render(
            <SarakUIProvider config={{ inputBorderType: 'underline' }}>
                <SarakTextarea placeholder="nota" />
            </SarakUIProvider>,
        );
        // 'solid' (default sem Provider) nunca toca `borderBottom`; só 'underline' toca.
        expect(screen.getByPlaceholderText('nota').style.borderBottom).toContain('2px solid');
    });

    it('sem Provider, mostra a mensagem de erro, repassa foco/desfoque e respeita disabled', () => {
        const onFocus = vi.fn();
        const onBlur = vi.fn();
        render(<SarakTextarea placeholder="nota" error="Obrigatório" onFocus={onFocus} onBlur={onBlur} disabled />);
        const box = screen.getByPlaceholderText('nota');
        expect(screen.getByText('Obrigatório')).toBeInTheDocument();
        expect(box).toBeDisabled();

        fireEvent.focus(box);
        fireEvent.blur(box);
        expect(onFocus).toHaveBeenCalledTimes(1);
        expect(onBlur).toHaveBeenCalledTimes(1);
    });
});
