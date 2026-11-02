import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { ThemeSidebarContent } from '../ThemeSidebarContent';
import { buildDecisionContext } from '../../../utils/decisionContext';
import { buildTokenIndex } from '../../../utils/decisions';

vi.mock('framer-motion', async (importOriginal) => {
    const actual = await importOriginal<typeof import('framer-motion')>();
    return {
        ...actual,
        motion: { ...actual.motion, div: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div> },
        AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>,
    };
});

vi.mock('../../MasterControlPanel', () => ({
    MasterControlPanel: (props: { draft: unknown; updateDraft: unknown; resetToken: unknown }) => (
        <div
            data-testid="master-control-panel"
            data-has-draft={String(props.draft !== undefined)}
            data-has-update-draft={String(typeof props.updateDraft === 'function')}
            data-has-reset-token={String(typeof props.resetToken === 'function')}
        />
    )
}));

const hyperGranularityCapture: { props: Record<string, unknown> | null } = { props: null };

vi.mock('../../../Panels/HyperGranularityTab', () => ({
    HyperGranularityTab: (props: Record<string, unknown>) => {
        hyperGranularityCapture.props = props;
        return <div data-testid="hyper-granularity-tab" />;
    }
}));

const decisionContext = buildDecisionContext();
const tokenIndex = buildTokenIndex(decisionContext);

const baseProps = () => ({
    searchQuery: '',
    filteredResults: [],
    viewMode: 'preview',
    panelView: { kind: 'home' },
    options: {
        sarak: { branding: {}, updateBranding: vi.fn() },
        globalComponent: undefined,
        catalogMap: new Map(),
        draft: { mode: 'dark', headingFont: 'Outfit', bodyFont: 'Inter', colorPalette: 'ceu-aberto' },
        updateDraft: vi.fn(),
        previewDevice: 'desktop',
        onApplyPreset: vi.fn(),
        currentMode: 'dark',
        draftMode: 'dark',
    },
    decisionContext,
    tokenIndex,
    themeName: 'Sarak Sovereign',
    dirtyDecisions: new Set(),
    onOpenDecision: vi.fn(),
    onOpenBrand: vi.fn(),
    setPendingBranding: vi.fn(),
    onBrandGenerated: vi.fn(),
    resetComponent: vi.fn(),
    resetToken: vi.fn(),
    handleApplyToSystem: vi.fn(),
    toast: null,
    onApplyFullTheme: vi.fn(),
});

const renderContent = (overrides: Record<string, unknown> = {}) => {
    const props = { ...baseProps(), ...overrides } as unknown as React.ComponentProps<typeof ThemeSidebarContent>;
    return render(<SarakUIProvider><ThemeSidebarContent {...props} /></SarakUIProvider>);
};

describe('ThemeSidebarContent', () => {
    it('na lista, mostra "Usar minha marca" primeiro e as seis decisões, sem galeria nem modos', () => {
        renderContent();

        expect(screen.getByRole('button', { name: /Usar minha marca/ })).toBeInTheDocument();
        const rows = screen.getAllByRole('listitem').map((row) => row.textContent);
        expect(rows).toHaveLength(6);
        ['Tema', 'Cores', 'Fontes', 'Forma', 'Componentes', 'Layout'].forEach((title, index) => expect(rows[index]).toContain(title));
        expect(screen.queryByRole('button', { name: 'Abrir galeria' })).toBeNull();
        expect(screen.queryByRole('radiogroup')).toBeNull();
    });

    it('cada linha mostra o valor que vale agora e uma linha alterada ganha a marca', () => {
        renderContent({ dirtyDecisions: new Set(['fonts']) });

        const fonts = screen.getByRole('button', { name: /Fontes/ });
        expect(fonts).toHaveTextContent('Outfit + Inter');
        expect(fonts.querySelector('[aria-label="Alterada"]')).not.toBeNull();
        expect(screen.getByRole('button', { name: /^Tema/ })).toHaveTextContent('Sarak Sovereign');
        expect(screen.getByRole('button', { name: /^Cores/ }).querySelector('[aria-label="Alterada"]')).toBeNull();
    });

    it('clicar numa linha abre a decisão; clicar no atalho abre a marca', () => {
        const onOpenDecision = vi.fn();
        const onOpenBrand = vi.fn();
        renderContent({ onOpenDecision, onOpenBrand });

        fireEvent.click(screen.getByRole('button', { name: /Cores/ }));
        fireEvent.click(screen.getByRole('button', { name: /Usar minha marca/ }));

        expect(onOpenDecision).toHaveBeenCalledWith('colors');
        expect(onOpenBrand).toHaveBeenCalledTimes(1);
    });

    it('ao voltar de uma decisão, o foco vai à linha dela', () => {
        renderContent({ panelView: { kind: 'home', focusId: 'fonts' } });

        expect(screen.getByRole('button', { name: /Fontes/ })).toHaveFocus();
    });

    it('no modo catalog, passa draft/updateDraft/resetToken (a MESMA instância de useDesignDraft de ThemeCustomizationTab) para MasterControlPanel — sem instância paralela', () => {
        renderContent({ viewMode: 'catalog' });

        const panel = screen.getByTestId('master-control-panel');
        expect(panel).toHaveAttribute('data-has-draft', 'true');
        expect(panel).toHaveAttribute('data-has-update-draft', 'true');
        expect(panel).toHaveAttribute('data-has-reset-token', 'true');
    });

    it('no modo command-center, renderiza o HyperGranularityTab', () => {
        renderContent({ viewMode: 'command-center' });

        expect(screen.getByTestId('hyper-granularity-tab')).toBeDefined();
    });

    // O HyperGranularityTab instanciava a PRÓPRIA useDesignDraft — duas fontes de rascunho vivas ao mesmo tempo.
    // Provar UMA fonte = provar que são as MESMAS referências que o painel usa em todo o resto.
    it('no modo command-center, passa a MESMA instância de draft/updateDraft/handleApplyToSystem/resetComponent/resetToken/toast do painel', () => {
        const draft = { mode: 'dark' };
        const updateDraft = vi.fn();
        const handleApplyToSystem = vi.fn();
        const resetComponent = vi.fn();
        const resetToken = vi.fn();
        const toast = { type: 'success' as const, message: 'Design aplicado.' };
        const options = { ...baseProps().options, draft, updateDraft };
        renderContent({ viewMode: 'command-center', options, handleApplyToSystem, resetComponent, resetToken, toast });

        const captured = hyperGranularityCapture.props;
        expect(captured).not.toBeNull();
        expect(captured?.draft).toBe(draft);
        expect(captured?.updateDraft).toBe(updateDraft);
        expect(captured?.handleApplyToSystem).toBe(handleApplyToSystem);
        expect(captured?.resetComponent).toBe(resetComponent);
        expect(captured?.resetToken).toBe(resetToken);
        expect(captured?.toast).toBe(toast);
    });
});

describe('busca por sentido', () => {
    const token = (id: string, label: string) => ({ id, label, type: 'text', defaultValue: '' });
    const search = (filteredResults: unknown[], extra: Record<string, unknown> = {}) =>
        renderContent({ searchQuery: 'fonte', filteredResults, ...extra });

    it('mostra a contagem no título e os resultados na ordem recebida (relevância)', () => {
        search([token('zeta', 'Zeta Texto'), token('alfa', 'Alfa Texto')]);

        expect(screen.getByText('Resultados da busca (2)')).toBeInTheDocument();
        expect(screen.getAllByText(/Texto$/).map((node) => node.textContent)).toEqual(['Zeta Texto', 'Alfa Texto']);
    });

    it('mostra `Decisão › Seção` do token que mora numa decisão e deixa o resto editável no próprio resultado', () => {
        search([token('headingFont', 'Fonte de Títulos'), token('semGrupo', 'Sem Grupo')]);

        const paths = screen.getAllByTestId('search-result-path');
        expect(paths).toHaveLength(1);
        expect(paths[0].textContent).toMatch(/^Fontes/);
        expect(screen.getByRole('button', { name: /Abrir Fonte de Títulos em Fontes/ })).toBeInTheDocument();
        expect(document.querySelector('[data-token-row="semGrupo"]')).not.toBeNull();
    });

    it('clicar no resultado abre a decisão certa com o token em foco', () => {
        const onOpenDecision = vi.fn();
        search([token('headingFont', 'Fonte de Títulos')], { onOpenDecision });

        fireEvent.click(screen.getByRole('button', { name: /Abrir Fonte de Títulos/ }));

        expect(onOpenDecision).toHaveBeenCalledWith('fonts', 'headingFont');
    });

    it('busca sem resultado mostra o estado vazio com a consulta', () => {
        search([]);

        expect([screen.getByText('Resultados da busca (0)').className, screen.getByRole('status').className].every((className) => className.includes('--sarak-type-scale-caption') && className.includes('12px'))).toBe(true);
        expect(screen.getByRole('status')).toHaveTextContent('Nenhum controle encontrado para “fonte”.');
    });
});
