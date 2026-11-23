import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ShellPreferenceChoiceGroup } from '../ShellPreferenceChoiceGroup';

type Size = 'sm' | 'md' | 'lg';
const CHOICES = [
    { value: 'sm' as Size, label: 'P', full: 'Pequena' },
    { value: 'md' as Size, label: 'M', full: 'Média' },
    { value: 'lg' as Size, label: 'G', full: 'Grande' },
];

const renderGroup = (props: Partial<React.ComponentProps<typeof ShellPreferenceChoiceGroup<Size>>> = {}) => {
    const onSelect = vi.fn();
    render(<ShellPreferenceChoiceGroup<Size> label="Tamanho da fonte" choices={CHOICES} current="md" onSelect={onSelect} variant="bar" {...props} />);
    return onSelect;
};

describe('ShellPreferenceChoiceGroup — variante bar (fixada na barra)', () => {
    it('é um grupo nomeado, com um botão por opção e a escolhida pressionada', () => {
        renderGroup();
        expect(screen.getByRole('group', { name: 'Tamanho da fonte' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'P' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('clicar numa opção entrega o valor dela', () => {
        const onSelect = renderGroup();
        fireEvent.click(screen.getByRole('button', { name: 'G' }));
        expect(onSelect).toHaveBeenCalledWith('lg');
    });

    it('não tem véu de fundo: o texto fica direto sobre a barra (o contraste é o da barra)', () => {
        renderGroup();
        const group = screen.getByRole('group');
        expect(group.className).not.toMatch(/bg-\[/);
        screen.getAllByRole('button').filter((b) => b.getAttribute('aria-pressed') === 'false').forEach((button) => {
            expect(button.className).not.toMatch(/(^|\s)bg-\[/);
        });
    });

    it('a altura do grupo é a do item da barra do topo: o respiro vertical vem da métrica compartilhada (py-1.5 = 0,375 rem)', () => {
        renderGroup();
        expect(screen.getByRole('button', { name: 'M' })).toHaveStyle({ paddingBlock: '0.375rem' });
    });

    it('na lateral (vertical) ocupa a coluna inteira', () => {
        renderGroup({ orientation: 'vertical' });
        expect(screen.getByRole('group').className).toContain('w-full');
    });

    it('a opção que não está escolhida lê o texto principal da barra, não o apagado do item inativo (contraste sobre degradê)', () => {
        renderGroup();
        const idle = screen.getByRole('button', { name: 'P' });
        expect(idle.className).toContain('text-[var(--sarak-text-main,');
        expect(idle.className).not.toContain('--text-muted');
    });
});

describe('ShellPreferenceChoiceGroup — variante menu (linhas do ⚙ e da gaveta)', () => {
    it('uma linha por opção, como item de menu com seleção, e a escolhida marcada', () => {
        renderGroup({ variant: 'menu' });
        const rows = screen.getAllByRole('menuitemradio');
        expect(rows.map((row) => row.textContent)).toEqual(['Pequena', 'Média', 'Grande']);
        expect(screen.getByRole('menuitemradio', { name: 'Média' })).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByRole('menuitemradio', { name: 'Pequena' })).toHaveAttribute('aria-checked', 'false');
    });

    it('a linha escolhida leva o visto; as outras não', () => {
        renderGroup({ variant: 'menu' });
        expect(screen.getByRole('menuitemradio', { name: 'Média' }).querySelector('svg')).not.toBeNull();
        expect(screen.getByRole('menuitemradio', { name: 'Grande' }).querySelector('svg')).toBeNull();
    });

    it('clicar numa linha entrega o valor dela', () => {
        const onSelect = renderGroup({ variant: 'menu' });
        fireEvent.click(screen.getByRole('menuitemradio', { name: 'Grande' }));
        expect(onSelect).toHaveBeenCalledWith('lg');
    });

    it('sem rótulo longo, a linha usa o curto', () => {
        renderGroup({ variant: 'menu', choices: [{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }] });
        expect(screen.getByRole('menuitemradio', { name: 'S' })).toBeInTheDocument();
    });
});
