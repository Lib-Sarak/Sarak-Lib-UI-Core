import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakTagInput, type SarakTagInputProps } from '../SarakTagInput';

const Controlled = (props: Partial<SarakTagInputProps> & { initial?: string[] }): React.ReactElement => {
    const [value, setValue] = useState<string[]>(props.initial ?? []);
    return <SarakTagInput label="Etiquetas" {...props} value={value} onChange={setValue} />;
};

const field = (): HTMLElement => screen.getByRole('textbox', { name: 'Etiquetas' });
const type = (text: string): void => { fireEvent.change(field(), { target: { value: text } }); };

describe('SarakTagInput', () => {
    it('Enter fecha a etiqueta e limpa o campo', () => {
        render(<Controlled />);

        type('urgente');
        fireEvent.keyDown(field(), { key: 'Enter' });

        expect(screen.getByRole('list', { name: 'Etiquetas' })).toHaveTextContent('urgente');
        expect(field()).toHaveValue('');
    });

    it('a vírgula digitada ou colada separa várias etiquetas de uma vez', () => {
        render(<Controlled />);

        type('a, b ,c');

        expect(screen.getAllByRole('listitem').map((item) => item.textContent?.replace('×', ''))).toEqual(['a', 'b', 'c']);
    });

    it('recusa duplicada com aviso e mantém o texto para o usuário corrigir', () => {
        render(<Controlled initial={['a']} />);

        type('a');
        fireEvent.keyDown(field(), { key: 'Enter' });

        expect(screen.getByRole('alert')).toHaveTextContent('Esta etiqueta já foi adicionada');
        expect(field()).toHaveValue('a');
    });

    it('respeita o limite e a validação do host', () => {
        render(<Controlled max={1} validate={(tag) => (tag.length < 3 ? 'curta demais' : undefined)} />);

        type('ab');
        fireEvent.keyDown(field(), { key: 'Enter' });
        expect(screen.getByRole('alert')).toHaveTextContent('curta demais');

        type('abc');
        fireEvent.keyDown(field(), { key: 'Enter' });
        type('abcd');
        fireEvent.keyDown(field(), { key: 'Enter' });
        expect(screen.getByRole('alert')).toHaveTextContent('Limite de 1 etiquetas');
    });

    it('Backspace no campo vazio tira a última, e o botão remove a escolhida', () => {
        const onChange = vi.fn();
        render(<SarakTagInput label="Etiquetas" value={['a', 'b']} onChange={onChange} />);

        fireEvent.keyDown(field(), { key: 'Backspace' });
        expect(onChange).toHaveBeenLastCalledWith(['a']);

        fireEvent.click(screen.getByRole('button', { name: 'Remover a' }));
        expect(onChange).toHaveBeenLastCalledWith(['b']);
    });

    it('fechar o campo com texto pendente também grava a etiqueta', () => {
        render(<Controlled />);

        type('pendente');
        fireEvent.blur(field());

        expect(screen.getByRole('list', { name: 'Etiquetas' })).toHaveTextContent('pendente');
    });

    it('com repetidas permitidas, remover uma tira só ela, pela posição', () => {
        const onChange = vi.fn();
        render(<SarakTagInput label="Etiquetas" value={['a', 'b', 'a']} allowDuplicates onChange={onChange} />);

        fireEvent.click(screen.getAllByRole('button', { name: 'Remover a' })[1]);

        expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    });
});
