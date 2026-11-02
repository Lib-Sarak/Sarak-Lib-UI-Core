import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { ThemeSearchResults } from '../ThemeSearchResults';
import type { DecisionId, TokenLocation } from '../../../utils/decisions';

const token = (id: string, label: string) => ({ id, label, type: 'text' as const, defaultValue: '' });
const index = new Map<string, TokenLocation>([
    ['headingFont', { decisionId: 'fonts', layer: 'main', section: '' }],
    ['cardRadiusTL', { decisionId: 'shape', layer: 'rest', section: 'Geometria e Bordas' }],
]);

const renderResults = (
    results: ReturnType<typeof token>[], onOpenToken = vi.fn(), tokenIndex: Map<string, TokenLocation> = index, query = 'fonte',
) => render(
    <SarakUIProvider>
        <ThemeSearchResults
            query={query}
            results={results}
            tokenIndex={tokenIndex}
            onOpenToken={onOpenToken}
            catalogMap={new Map([['headingFont', { name: 'Fonte dos títulos' }]])}
            draft={{} as never}
            updateDraft={vi.fn()}
            previewDevice="desktop"
        />
    </SarakUIProvider>,
);

describe('ThemeSearchResults', () => {
    it('cada resultado diz onde mora (decisão › seção) e leva ao token ao ser aberto', () => {
        const onOpenToken = vi.fn();
        renderResults([token('headingFont', 'Fonte'), token('cardRadiusTL', 'Quina')], onOpenToken);

        const paths = screen.getAllByTestId('search-result-path').map((node) => node.textContent);
        expect(paths).toEqual(['Fontes', 'Forma › Geometria e Bordas']);

        fireEvent.click(screen.getByRole('button', { name: /Abrir Quina em Forma › Geometria e Bordas/ }));
        expect(onOpenToken).toHaveBeenCalledWith('shape', 'cardRadiusTL');
    });

    it('o nome do catálogo vence o do schema no resultado', () => {
        renderResults([token('headingFont', 'Fonte')]);

        expect(screen.getByRole('button', { name: /Abrir Fonte dos títulos em Fontes/ })).toBeInTheDocument();
    });

    it('o token que nenhuma decisão lista segue editável no próprio resultado', () => {
        renderResults([token('semDecisao', 'Sem decisão')]);

        expect(screen.queryByRole('button', { name: /Abrir Sem decisão/ })).toBeNull();
        expect(document.querySelector('[data-token-row="semDecisao"]')).not.toBeNull();
    });

    describe('agrupamento por decisão', () => {
        const manyIn = (decisionId: DecisionId, prefix: string, count: number) => Array.from({ length: count }, (_, i) => ({
            token: token(`${prefix}${i}`, `${prefix} ${i}`),
            location: { decisionId, layer: 'rest', section: 'Seção' } as TokenLocation,
        }));
        const indexOf = (entries: { token: { id: string }; location: TokenLocation }[]) => new Map(entries.map((e) => [e.token.id, e.location]));

        it('mostra cada decisão com a contagem, até 5 por grupo, e o resto sob "Ver todos"', async () => {
            const entries = [...manyIn('layout', 'lay', 8), ...manyIn('shape', 'shp', 3)];
            renderResults(entries.map((e) => e.token), vi.fn(), indexOf(entries));

            const layout = screen.getByRole('region', { name: 'Layout (8)' });
            expect(screen.getByRole('region', { name: 'Forma (3)' })).toBeInTheDocument();
            expect(within(layout).getAllByRole('listitem')).toHaveLength(5);

            await userEvent.click(within(layout).getByRole('button', { name: 'Ver todos (8)' }));
            expect(within(layout).getAllByRole('listitem')).toHaveLength(8);
            expect(within(layout).getByRole('button', { name: 'Ver menos' })).toHaveAttribute('aria-expanded', 'true');
        });

        it('com mais de 20 resultados abre primeiro as áreas, e a área escolhida abre inteira', async () => {
            const entries = [...manyIn('layout', 'lay', 14), ...manyIn('shape', 'shp', 9)];
            renderResults(entries.map((e) => e.token), vi.fn(), indexOf(entries));

            expect(screen.queryByTestId('search-result-path')).toBeNull();
            await userEvent.click(screen.getByRole('button', { name: 'Layout (14)' }));
            expect(screen.getAllByTestId('search-result-path')).toHaveLength(14);

            await userEvent.click(screen.getByRole('button', { name: 'Todas as áreas' }));
            expect(screen.getByRole('button', { name: 'Forma (9)' })).toBeInTheDocument();
        });

        it('só com o teclado: Tab chega ao resultado e Enter abre o token', async () => {
            const onOpenToken = vi.fn();
            const entries = manyIn('layout', 'lay', 2);
            renderResults(entries.map((e) => e.token), onOpenToken, indexOf(entries));

            await userEvent.tab();
            expect(screen.getByRole('button', { name: /Abrir lay 0/ })).toHaveFocus();
            await userEvent.keyboard('{Enter}');
            expect(onOpenToken).toHaveBeenCalledWith('layout', 'lay0');
        });

        it('acha o lugar das opções: a seção cujo nome casa com a consulta leva à decisão', async () => {
            const onOpenToken = vi.fn();
            const entries = [{ token: token('a', 'A'), location: { decisionId: 'shape', layer: 'rest', section: 'Cantos' } as TokenLocation }];
            renderResults([], onOpenToken, indexOf(entries), 'cantos');

            await userEvent.click(screen.getByRole('button', { name: 'Abrir Forma › Cantos' }));
            expect(onOpenToken).toHaveBeenCalledWith('shape');
        });
    });

    describe('sem resultado', () => {
        it('sugere o termo mais próximo e oferece as seis decisões', async () => {
            const onOpenToken = vi.fn();
            const catalogMap = new Map([['headingFont', { name: 'Fonte dos títulos', tags: ['tooltip'] }]]);
            render(
                <SarakUIProvider>
                    <ThemeSearchResults
                        query="tooltpp" results={[]} tokenIndex={new Map()} onOpenToken={onOpenToken}
                        catalogMap={catalogMap} draft={{} as never} updateDraft={vi.fn()} previewDevice="desktop"
                    />
                </SarakUIProvider>,
            );

            expect(screen.getByText('Você quis dizer “tooltip”?')).toBeInTheDocument();
            const decisions = document.querySelectorAll('[data-search-decision]');
            expect(decisions).toHaveLength(6);

            await userEvent.click(screen.getByRole('button', { name: 'Cores' }));
            expect(onOpenToken).toHaveBeenCalledWith('colors');
        });
    });
});
