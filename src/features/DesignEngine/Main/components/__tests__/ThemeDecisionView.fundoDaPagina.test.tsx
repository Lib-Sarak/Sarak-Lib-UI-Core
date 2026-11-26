import React from 'react';
import { fireEvent, render, screen, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { ThemeDecisionView } from '../ThemeDecisionView';
import type { DecisionOptionsContext } from '../ThemeDecisionOptions';
import { buildDecisionContext } from '../../../utils/decisionContext';
import { COLUMN_DECISIONS, decisionLayers } from '../../../utils/decisions';
import { useDesignVariables } from '../../../../../core/Design/hooks/useDesignVariables';
import { sarakGetDefaultDesignState } from '../../../../../core/Design/master-map';

vi.mock('../ThemeDecisionOptions', () => ({ ThemeDecisionOptions: () => <div data-testid="options" /> }));
vi.setConfig({ testTimeout: 30000 });

const decisionContext = buildDecisionContext();
const colors = COLUMN_DECISIONS.find((decision) => decision.id === 'colors')!;
const options = { sarak: {}, draft: {}, updateDraft: vi.fn(), catalogMap: new Map(), previewDevice: 'desktop' } as unknown as DecisionOptionsContext;

describe('Cores → Ajustes principais: o controle que pinta a página', () => {
    it('a cor de fundo da página está entre os ajustes principais, e a base do vidro não se passa por ela', () => {
        const mainIds = decisionLayers(colors, decisionContext).mainTokens.map((token) => token.id);
        expect(mainIds).toContain('colorBgBody');
        expect(mainIds).toContain('bgBaseColor');
    });

    it('o painel rotula os dois controles pelo que cada um pinta', () => {
        render(<SarakUIProvider><ThemeDecisionView decision={colors} decisionContext={decisionContext} options={options} /></SarakUIProvider>);
        fireEvent.click(screen.getByRole('button', { name: 'Ajustes principais' }));
        const page = document.querySelector('[data-token-row="colorBgBody"]');
        const glass = document.querySelector('[data-token-row="bgBaseColor"]');
        expect(page).toHaveTextContent('Cor de Fundo da Página');
        expect(glass).toHaveTextContent('Cor de Base do Vidro e dos Painéis');
        expect(glass).not.toHaveTextContent('Cor de Fundo Base');
    });

    it('editar a cor da página para #f3eadb faz `--bg-body` valer #f3eadb; a base do vidro segue o seu próprio dono', () => {
        const { variables, responsiveCSS } = renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), colorBgBody: '#f3eadb', bgBaseColor: '#112233' })).result.current;
        const written = { ...variables } as Record<string, string>;
        expect(written['--bg-body'] ?? /--bg-body:\s*([^;]+);/.exec(responsiveCSS)?.[1]?.trim()).toBe('#f3eadb');
        expect(written['--sarak-bg-base'] ?? /--sarak-bg-base:\s*([^;]+);/.exec(responsiveCSS)?.[1]?.trim()).toBe('#112233');
    });
});
