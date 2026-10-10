import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakMultiSelect, type SarakMultiSelectOption } from '../SarakMultiSelect';

const options: SarakMultiSelectOption[] = [
    { value: 'rh', label: 'Recursos Humanos' },
    { value: 'fin', label: 'Financeiro' },
    { value: 'ti', label: 'Tecnologia' },
];

const renderMS = (props: Partial<React.ComponentProps<typeof SarakMultiSelect>> = {}): ReturnType<typeof render> =>
    render(
        <SarakUIProvider>
            <SarakMultiSelect label="Setores" options={options} {...props} />
        </SarakUIProvider>,
    );

describe('SarakMultiSelect', () => {
    it('liga o rótulo visível ao campo de busca', () => {
        renderMS();
        const input = screen.getByRole('combobox', { name: 'Setores' });
        expect(input).toHaveAttribute('aria-labelledby', screen.getByText('Setores').id);
    });

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

describe('Erro de campo pelo SarakFieldError', () => {
    it('com `error`, há um role="alert" com o texto e o controle o referencia', () => {
        render(<SarakMultiSelect options={options} error="Campo obrigatório" />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Campo obrigatório');
        expect(alert.querySelector('svg')).not.toBeNull();
        expect(alert.id).toMatch(/-error$/);
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-describedby', alert.id);
    });

    it('sem `error`, nada é renderizado', () => {
        render(<SarakMultiSelect options={options} />);
        expect(screen.queryByRole('alert')).toBeNull();
    });
});

describe('SarakMultiSelect — textos da lib seguem o idioma', () => {
    it('traduz o placeholder e o rótulo de remoção dos chips', () => {
        const { unmount } = renderMS({ value: ['rh'] });
        expect(screen.getByRole('button', { name: 'Remover Recursos Humanos' })).toBeInTheDocument();
        unmount();

        const { rerender } = render(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakMultiSelect label="Departments" options={options} value={['rh']} />
            </SarakUIProvider>,
        );
        expect(screen.getByRole('button', { name: 'Remove Recursos Humanos' })).toBeInTheDocument();

        rerender(
            <SarakUIProvider config={{ language: 'en' }}>
                <SarakMultiSelect label="Departments" options={options} />
            </SarakUIProvider>,
        );
        expect(screen.getByRole('combobox', { name: 'Departments' })).toHaveAttribute('placeholder', 'Search...');
    });
});
