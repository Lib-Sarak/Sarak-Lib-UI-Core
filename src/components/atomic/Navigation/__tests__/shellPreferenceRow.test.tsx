import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { renderShellPreferenceRow } from '../shellPreferenceRow';
import { LIBRARY_TEXT_CATALOG, type SarakLibraryLanguage } from '../../../../core/i18n/catalog';

const renderRow = (ui: React.ReactNode, config?: Record<string, unknown>) =>
    render(<SarakUIProvider config={config}>{ui}</SarakUIProvider>);

/** `t` de teste — resolve direto do catálogo, no idioma pedido (default: pt, a base da lib). */
const makeT = (language: SarakLibraryLanguage = 'pt') =>
    ((key: keyof typeof LIBRARY_TEXT_CATALOG) => LIBRARY_TEXT_CATALOG[key][language]) as Parameters<typeof renderShellPreferenceRow>[1]['t'];

const ctx = (overrides: Partial<Parameters<typeof renderShellPreferenceRow>[1]> = {}) => ({
    isNavHidden: false,
    onToggleNavCollapsed: vi.fn(),
    t: makeT(),
    ...overrides,
});

describe('renderShellPreferenceRow — dispatcher do ⚙ Preferências / drawer mobile', () => {
    it('colorMode: linha do ShellThemeToggle (variante vertical)', () => {
        renderRow(renderShellPreferenceRow('colorMode', ctx()));
        expect(screen.getByText(/^Modo (Claro|Escuro)$/)).toBeInTheDocument();
    });

    it("navCollapsed: linha própria, rótulo muda conforme isNavHidden e dispara onToggleNavCollapsed", () => {
        const onToggleNavCollapsed = vi.fn();
        renderRow(renderShellPreferenceRow('navCollapsed', ctx({ onToggleNavCollapsed })));
        const item = screen.getByText('Recolher navegação');
        fireEvent.click(item);
        expect(onToggleNavCollapsed).toHaveBeenCalledTimes(1);
    });

    it('navCollapsed com isNavHidden=true: rótulo vira "Expandir navegação"', () => {
        renderRow(renderShellPreferenceRow('navCollapsed', ctx({ isNavHidden: true })));
        expect(screen.getByText('Expandir navegação')).toBeInTheDocument();
    });

    it('fontSize: linha com label "Tamanho da fonte" e o segmented control (P/M/G)', () => {
        renderRow(renderShellPreferenceRow('fontSize', ctx()));
        expect(screen.getByText('Tamanho da fonte')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Tamanho da fonte' })).toBeInTheDocument();
    });

    it('navigationStyle: linha com label "Navegação" e o segmented control (Topo/Lateral)', () => {
        renderRow(renderShellPreferenceRow('navigationStyle', ctx()));
        expect(screen.getByText('Navegação')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Estilo de navegação' })).toBeInTheDocument();
    });

    it('language: linha do ShellLanguageSelector (variante vertical) — não monta sem 2+ idiomas habilitados', () => {
        // Zero idioma explícito: o comportamento sob teste é o do COMPONENTE
        // (esconder com 0 ou 1 idioma), não o que o tema-padrão declara hoje.
        renderRow(renderShellPreferenceRow('language', ctx()), { enabledLanguages: [] });
        expect(screen.queryByRole('button')).toBeNull();
    });

    // os textos da própria lib seguem o idioma que vale.
    it('navCollapsed: com `t` em inglês, o rótulo sai em inglês', () => {
        renderRow(renderShellPreferenceRow('navCollapsed', ctx({ t: makeT('en') })));
        expect(screen.getByText('Collapse navigation')).toBeInTheDocument();
    });
});
