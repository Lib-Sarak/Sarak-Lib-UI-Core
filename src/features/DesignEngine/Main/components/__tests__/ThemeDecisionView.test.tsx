import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { ThemeDecisionView } from '../ThemeDecisionView';
import type { DecisionOptionsContext } from '../ThemeDecisionOptions';
import { buildDecisionContext } from '../../../utils/decisionContext';
import { buildTokenIndex, getDecision } from '../../../utils/decisions';

vi.mock('../ThemeDecisionOptions', () => ({ ThemeDecisionOptions: () => <div data-testid="options" /> }));

const decisionContext = buildDecisionContext();
const tokenIndex = buildTokenIndex(decisionContext);
const options = { sarak: {}, draft: {}, updateDraft: vi.fn(), catalogMap: new Map(), previewDevice: 'desktop' } as unknown as DecisionOptionsContext;

const renderView = (decisionId: string, focusTokenId?: string) => render(
    <SarakUIProvider>
        <ThemeDecisionView
            decision={getDecision(decisionId)!}
            decisionContext={decisionContext}
            options={options}
            focusTokenId={focusTokenId}
            focusLocation={focusTokenId ? tokenIndex.get(focusTokenId) : undefined}
        />
    </SarakUIProvider>,
);

vi.setConfig({ testTimeout: 30000 });

describe('ThemeDecisionView', () => {
    it('mostra as opções e os ajustes principais (nível 2) e o ajuste fino recolhido (nível 3)', () => {
        renderView('colors');

        expect(screen.getByTestId('options')).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Ajustes principais' }).querySelector('[data-token-row="primaryColor"]')).not.toBeNull();
        expect(screen.getByRole('button', { name: /Ajuste fino/ })).toHaveAttribute('aria-expanded', 'false');
    });

    it('a decisão Layout responde às cinco perguntas da barra, cada uma com a amostra real', () => {
        renderView('layout');

        ['Onde fica a barra', 'Como é a barra', 'O que aparece na barra', 'Marca', 'Comportamento da barra'].forEach((name) => {
            const region = screen.getByRole('region', { name });
            expect(region.querySelector('[data-testid="bar-sample"]')).not.toBeNull();
            expect(region.querySelector('[data-token-row]')).not.toBeNull();
        });
        expect(document.querySelectorAll('[data-decision-question]')).toHaveLength(5);
    });

    it('a pergunta "O que aparece" põe os controles em linguagem do usuário', () => {
        renderView('layout');

        const what = screen.getByRole('region', { name: 'O que aparece na barra' });
        expect(what.querySelectorAll('[data-token-row]')).toHaveLength(8);
    });

    it('as outras decisões não ganham pergunta nem amostra de barra', () => {
        renderView('colors');

        expect(document.querySelector('[data-decision-question]')).toBeNull();
        expect(screen.queryByTestId('bar-sample')).toBeNull();
    });

    it('a decisão Tema não tem token nem ajuste fino: é só a galeria', () => {
        renderView('theme');

        expect(screen.getByTestId('options')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Ajuste fino/ })).toBeNull();
        expect(document.querySelectorAll('[data-token-row]')).toHaveLength(0);
    });

    it('o token da busca que mora no ajuste fino abre o nível 3 e recebe o foco', () => {
        const location = tokenIndex.get('cardRadiusTL');
        expect(location?.layer).toBe('rest');

        renderView('shape', 'cardRadiusTL');

        expect(screen.getByRole('button', { name: /Ajuste fino/ })).toHaveAttribute('aria-expanded', 'true');
        const row = document.querySelector<HTMLElement>('[data-token-row="cardRadiusTL"]');
        expect(row).not.toBeNull();
        expect(row).toHaveFocus();
        fireEvent.click(screen.getByRole('button', { name: 'Mostrar só os principais' }));
        expect(document.querySelector('[data-token-row="cardRadiusTL"]')).toBeNull();
    });
});
