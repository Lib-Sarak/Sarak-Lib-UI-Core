import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import SarakFilterSelect from '../SarakFilterSelect';

const renderSelect = (language: string, props: Partial<React.ComponentProps<typeof SarakFilterSelect>> = {}) =>
    render(
        <SarakUIProvider config={{ language }}>
            <SarakFilterSelect col="status" filters={{}} onChange={vi.fn()} options={['Aberto']} {...props} />
        </SarakUIProvider>,
    );

describe('SarakFilterSelect', () => {
    it('a opção inicial sai do catálogo no idioma escolhido', () => {
        const { unmount } = renderSelect('en');
        expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
        unmount();
        renderSelect('pt');
        expect(screen.getByRole('option', { name: 'Todos' })).toBeInTheDocument();
        expect(screen.queryByText('(All)')).not.toBeInTheDocument();
    });

    it('placeholder próprio vence o catálogo', () => {
        renderSelect('en', { placeholder: 'Qualquer' });
        expect(screen.getByRole('option', { name: 'Qualquer' })).toBeInTheDocument();
    });

    it('aceita { label, value }: mostra o rótulo e emite o valor', () => {
        const onChange = vi.fn();
        renderSelect('pt', { options: [{ label: 'Em aberto', value: 'open' }], onChange });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'open' } });
        expect(screen.getByRole('option', { name: 'Em aberto' })).toBeInTheDocument();
        expect(onChange).toHaveBeenCalledWith('status', 'open');
    });

    it('label vira o nome acessível do seletor', () => {
        renderSelect('pt', { label: 'Situação' });
        expect(screen.getByRole('combobox', { name: 'Situação' })).toBeInTheDocument();
    });
});
