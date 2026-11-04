import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ThemeDecisionList } from '../ThemeDecisionList';

const draft = { headingFont: "'Outfit', sans-serif", bodyFont: 'Inter', colorPalette: 'custom:analogous:#aa3366', primaryColor: '#aa3366' };

const renderList = (props: Partial<React.ComponentProps<typeof ThemeDecisionList>> = {}) => render(
    <ThemeDecisionList
        draft={draft}
        themeName=""
        dirtyDecisions={new Set()}
        onOpen={vi.fn()}
        onOpenBrand={vi.fn()}
        {...props}
    />,
);

describe('ThemeDecisionList', () => {
    it('lista as seis decisões na ordem do protótipo, depois do atalho de marca', () => {
        renderList();

        const rows = within(screen.getByRole('list', { name: 'Decisões do tema' })).getAllByRole('button');
        expect(rows.map((row) => row.getAttribute('data-decision-row'))).toEqual(['theme', 'colors', 'fonts', 'shape', 'components', 'layout']);
        expect(screen.getByRole('button', { name: /Usar minha marca/ }).getAttribute('data-decision-row')).toBe('brand');
    });

    it('sem nome de tema, o Tema diz "Personalizado"; com paleta criada, as Cores dizem qual', () => {
        renderList();

        expect(screen.getByRole('button', { name: /^Tema/ })).toHaveTextContent('Personalizado');
        expect(screen.getByRole('button', { name: /^Cores/ })).toHaveTextContent('Paleta criada');
        expect(screen.getByRole('button', { name: /^Fontes/ })).toHaveTextContent('Outfit + Inter');
    });

    it('marca como alterada só a decisão com mudança, e a marca tem nome acessível', () => {
        renderList({ dirtyDecisions: new Set(['shape']) });

        expect(screen.getAllByRole('img', { name: 'Alterada' })).toHaveLength(1);
        expect(screen.getByRole('button', { name: /^Forma/ }).querySelector('[aria-label="Alterada"]')).not.toBeNull();
    });

    it('abre a decisão pelo clique e devolve o foco à linha de onde se voltou', () => {
        const onOpen = vi.fn();
        const { rerender } = renderList({ onOpen });

        fireEvent.click(screen.getByRole('button', { name: /^Layout/ }));
        expect(onOpen).toHaveBeenCalledWith('layout');

        rerender(<ThemeDecisionList draft={draft} themeName="" dirtyDecisions={new Set()} onOpen={onOpen} onOpenBrand={vi.fn()} restoreFocusId="brand" />);
        expect(screen.getByRole('button', { name: /Usar minha marca/ })).toHaveFocus();
    });
});
