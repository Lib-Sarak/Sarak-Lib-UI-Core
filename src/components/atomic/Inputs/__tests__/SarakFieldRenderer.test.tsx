import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakFieldRenderer, type SarakFieldDefinition, type SarakFieldRendererProps } from '../SarakFieldRenderer';

const renderFields = (props: SarakFieldRendererProps): ReturnType<typeof render> => render(
    <SarakUIProvider options={{ fonts: 'none' }}><SarakFieldRenderer {...props} /></SarakUIProvider>,
);

const fields: SarakFieldDefinition[] = [
    { name: 'nome', type: 'text', label: 'Nome', required: true },
    { name: 'idade', type: 'number', label: 'Idade' },
    { name: 'bio', type: 'textarea', label: 'Bio' },
    { name: 'pais', type: 'select', label: 'País', options: [{ value: 'br', label: 'Brasil' }] },
    { name: 'ativo', type: 'switch', label: 'Ativo' },
    { name: 'aceite', type: 'checkbox', label: 'Aceito os termos' },
    { name: 'tags', type: 'tags', label: 'Etiquetas' },
];

describe('SarakFieldRenderer', () => {
    it('gera um controle rotulado por tipo, com obrigatório marcado', () => {
        renderFields({ fields, values: {}, onChange: () => undefined });

        expect(screen.getByRole('textbox', { name: 'Nome' })).toBeRequired();
        expect(screen.getByRole('spinbutton', { name: 'Idade' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Bio' }).tagName).toBe('TEXTAREA');
        expect(screen.getByRole('combobox', { name: 'País' })).toBeInTheDocument();
        expect(screen.getByRole('switch', { name: 'Ativo' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Aceito os termos' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Etiquetas' })).toBeInTheDocument();
    });

    it('devolve nome e valor tipado de cada campo', () => {
        const onChange = vi.fn();
        renderFields({ fields, values: { nome: 'Ana' }, onChange });

        expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('Ana');
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Idade' }), { target: { value: '31' } });
        expect(onChange).toHaveBeenLastCalledWith('idade', 31);
        fireEvent.change(screen.getByRole('combobox', { name: 'País' }), { target: { value: 'br' } });
        expect(onChange).toHaveBeenLastCalledWith('pais', 'br');
        fireEvent.click(screen.getByRole('switch', { name: 'Ativo' }));
        expect(onChange).toHaveBeenLastCalledWith('ativo', true);
    });

    it('mostra o erro de cada campo pelo nome', () => {
        renderFields({ fields, values: {}, errors: { nome: 'Informe o nome' }, onChange: () => undefined });

        expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome');
    });

    it('não executa conteúdo vindo de dado: rótulo com HTML sai como texto e o tipo desconhecido vira texto', () => {
        const hostile = '<img src=x onerror="window.__pwned = true">';
        const withHostile = [
            { name: 'a', type: 'javascript:alert(1)' as never, label: hostile },
            { name: '__proto__', type: 'text', label: 'Proto' },
        ] satisfies SarakFieldDefinition[];
        const { container } = renderFields({ fields: withHostile, values: { ['__proto__']: 'x' }, onChange: () => undefined });

        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText(hostile)).toBeInTheDocument();
        expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
        expect(screen.getByRole('textbox', { name: hostile })).toHaveAttribute('type', 'text');
    });

    it('anuncia obrigatório em cor, etiquetas, caixa e interruptor', () => {
        renderFields({
            fields: [
                { name: 'c', type: 'color', label: 'Cor', required: true },
                { name: 't', type: 'tags', label: 'Tags', required: true },
                { name: 'k', type: 'checkbox', label: 'Aceite', required: true },
                { name: 's', type: 'switch', label: 'Ligado', required: true },
            ],
            values: {}, onChange: () => undefined,
        });

        expect(screen.getByRole('textbox', { name: 'Cor' })).toBeRequired();
        expect(screen.getByRole('textbox', { name: 'Tags' })).toBeRequired();
        expect(screen.getByRole('checkbox', { name: 'Aceite' })).toBeRequired();
        expect(screen.getByRole('switch', { name: 'Ligado' })).toBeRequired();
    });
});
