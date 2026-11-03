import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakSetPicker, type SarakSetPickerOption } from '../SarakSetPicker';

const options: SarakSetPickerOption[] = [
    { value: 'a', label: 'Alfa', description: 'grupo um' },
    { value: 'b', label: 'Beta', description: 'grupo dois' },
    { value: 'c', label: 'Gama', description: 'grupo um' },
];

const Controlled = ({ initial = [] }: { initial?: string[] }): React.ReactElement => {
    const [value, setValue] = useState<string[]>(initial);
    return (
        <SarakSetPicker
            label="Moedas" options={options} value={value} onChange={setValue}
            filters={[{ id: 'um', label: 'Grupo um', match: (option) => option.description === 'grupo um' }]}
        />
    );
};

describe('SarakSetPicker', () => {
    it('lista disponíveis e escolhidos, com o nome do conjunto no grupo', () => {
        render(<Controlled initial={['b']} />);

        expect(screen.getByRole('group', { name: 'Moedas' })).toBeInTheDocument();
        expect(within(screen.getByRole('list', { name: 'Disponíveis' })).getAllByRole('listitem')).toHaveLength(2);
        expect(within(screen.getByRole('list', { name: 'Escolhidos' })).getByText('Beta')).toBeInTheDocument();
    });

    it('adiciona e remove por botões com nome do item', () => {
        render(<Controlled />);

        fireEvent.click(screen.getByRole('button', { name: 'Adicionar Beta' }));
        expect(within(screen.getByRole('list', { name: 'Escolhidos' })).getByText('Beta')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Remover Beta' }));
        expect(screen.getByText('Nada escolhido')).toBeInTheDocument();
    });

    it('a busca filtra as disponíveis e o filtro em chip soma com ela', () => {
        render(<Controlled />);

        fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar' }), { target: { value: 'gam' } });
        expect(screen.queryByText('Alfa')).not.toBeInTheDocument();
        expect(screen.getByText('Gama')).toBeInTheDocument();

        fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar' }), { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: 'Grupo um', pressed: false }));
        expect(screen.queryByText('Beta')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Grupo um', pressed: true })).toBeInTheDocument();
    });

    it('"adicionar todos os exibidos" respeita o que a busca deixou à vista', () => {
        const onChange = vi.fn();
        render(<SarakSetPicker options={options} value={['b']} onChange={onChange} />);

        fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar' }), { target: { value: 'alf' } });
        fireEvent.click(screen.getByRole('button', { name: 'Adicionar todos os exibidos' }));

        expect(onChange).toHaveBeenCalledWith(['b', 'a']);
    });

    it('"remover todos" esvazia o conjunto', () => {
        const onChange = vi.fn();
        render(<SarakSetPicker options={options} value={['a', 'b']} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Remover todos' }));

        expect(onChange).toHaveBeenCalledWith([]);
    });
});
