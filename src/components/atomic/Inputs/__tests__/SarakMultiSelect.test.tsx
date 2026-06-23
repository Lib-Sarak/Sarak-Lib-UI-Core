import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakMultiSelect, type MultiSelectOption } from '../SarakMultiSelect';

const options: MultiSelectOption[] = [
    { value: 'rh', label: 'Recursos Humanos' },
    { value: 'fin', label: 'Financeiro' },
    { value: 'ti', label: 'Tecnologia' },
];

const renderMS = (props: Partial<React.ComponentProps<typeof SarakMultiSelect>> = {}) =>
    render(
        <SarakUIProvider>
            <SarakMultiSelect label="Setores" options={options} {...props} />
        </SarakUIProvider>,
    );

describe('SarakMultiSelect', () => {
    it('deve filtrar a lista ao digitar sem perder o foco do input', () => {
        renderMS();
        const input = screen.getByRole('combobox');
        input.focus();
        fireEvent.change(input, { target: { value: 'fin' } });

        expect(screen.getByRole('option', { name: 'Financeiro' })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: 'Tecnologia' })).not.toBeInTheDocument();
        // O foco permanece no campo de busca durante a digitação.
        expect(document.activeElement).toBe(input);
    });

    it('deve adicionar um chip e emitir os values selecionados', () => {
        const onChange = vi.fn();
        renderMS({ onChange });
        const input = screen.getByRole('combobox');
        fireEvent.focus(input);
        fireEvent.mouseDown(screen.getByRole('option', { name: 'Financeiro' }));

        expect(onChange).toHaveBeenCalledWith(['fin']);
        expect(screen.getByText('Financeiro')).toBeInTheDocument();
    });

    it('deve remover um chip pelo botão X', () => {
        const onChange = vi.fn();
        renderMS({ value: ['rh', 'fin'], onChange });
        fireEvent.mouseDown(screen.getByRole('button', { name: 'Remover Recursos Humanos' }));
        expect(onChange).toHaveBeenCalledWith(['fin']);
    });
});
