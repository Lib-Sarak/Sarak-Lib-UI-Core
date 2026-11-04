import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SarakVersionList, type SarakVersionItem } from '../SarakVersionList';

const versions: SarakVersionItem[] = [
    { id: 'v2', label: 'Versão 2', author: 'Ana', at: '2026-05-02T10:00:00Z', summary: 'Prazo ajustado', current: true, diff: { fields: [{ label: 'Prazo', before: '10 dias', after: '15 dias' }] } },
    { id: 'v1', label: 'Versão 1', author: 'Beto', at: '2026-05-01T10:00:00Z' },
];

describe('SarakVersionList', () => {
    it('mostra autor, resumo e o selo "Atual" só na versão em vigor', () => {
        render(<SarakVersionList versions={versions} />);
        const [current, previous] = screen.getAllByRole('listitem');

        expect(current).toHaveTextContent('Atual');
        expect(current).toHaveTextContent('por Ana');
        expect(current).toHaveTextContent('Prazo ajustado');
        expect(previous).not.toHaveTextContent('Atual');
    });

    it('restaurar aparece só nas versões antigas e entrega o id ao host', async () => {
        const onRestore = vi.fn();
        render(<SarakVersionList versions={versions} onRestore={onRestore} />);

        expect(screen.getAllByRole('button', { name: /Restaurar/ })).toHaveLength(1);
        await userEvent.click(screen.getByRole('button', { name: 'Restaurar Versão 1' }));

        expect(onRestore).toHaveBeenCalledWith('v1');
    });

    it('a comparação abre e fecha, com aria-expanded ligado ao conteúdo', async () => {
        render(<SarakVersionList versions={versions} />);
        const toggle = screen.getByRole('button', { name: 'Comparar com a anterior' });

        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(toggle);

        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(document.getElementById(toggle.getAttribute('aria-controls') ?? '')).toHaveTextContent('15 dias');
        await userEvent.click(screen.getByRole('button', { name: 'Ocultar comparação' }));
        expect(screen.queryByText('15 dias')).not.toBeInTheDocument();
    });

    it('controlado, a lista só abre o que o host manda', async () => {
        const onOpenIdsChange = vi.fn();
        render(<SarakVersionList versions={versions} openIds={[]} onOpenIdsChange={onOpenIdsChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Comparar com a anterior' }));

        expect(onOpenIdsChange).toHaveBeenCalledWith(['v2']);
        expect(screen.queryByText('15 dias')).not.toBeInTheDocument();
    });

    it('sem versões, mostra o estado vazio', () => {
        render(<SarakVersionList versions={[]} />);

        expect(screen.getByText('Nenhuma versão registrada.')).toBeInTheDocument();
    });
});
