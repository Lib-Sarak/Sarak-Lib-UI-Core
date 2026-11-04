import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ThemeDecisionOptions, type DecisionOptionsContext } from '../ThemeDecisionOptions';
import { DECISIONS } from '../../../utils/decisions';

// Cada grupo desenha componentes reais; aqui só importa QUAL grupo cada decisão monta.
vi.mock('../../../Canvas/components/PresetsCatalog', () => ({
    PresetsCatalog: ({ group }: { group: string }) => <div data-testid={`catalog-${group}`} />,
}));
vi.mock('../../../Canvas/components/PersonalityCatalog', () => ({ PersonalityCatalog: () => <div data-testid="catalog-personalities" /> }));
vi.mock('../PaletteSection', () => ({ PaletteSection: () => <div data-testid="palette-section" /> }));
vi.mock('../ThemeGlobalSettings', () => ({ ThemeGlobalSettings: () => <div data-testid="global-block" /> }));

const context = { sarak: { systemDesign: {} }, draft: {}, updateDraft: vi.fn(), onApplyPreset: vi.fn(), catalogMap: new Map(), previewDevice: 'desktop', currentMode: 'dark', draftMode: 'dark' } as unknown as DecisionOptionsContext;

const groupsOf = (id: string) => DECISIONS.find((decision) => decision.id === id)!.groups;
const mounted = (id: string): string[] => {
    const { container, unmount } = render(<ThemeDecisionOptions groups={groupsOf(id)} context={context} />);
    const ids = Array.from(container.querySelectorAll('[data-testid]')).map((node) => node.getAttribute('data-testid') as string);
    unmount();
    return ids;
};

describe('ThemeDecisionOptions', () => {
    it.each([
        ['theme', ['catalog-personalities', 'catalog-themes']],
        ['colors', ['palette-section']],
        ['fonts', ['catalog-fontPairs', 'catalog-typeScale', 'catalog-fonts']],
        ['shape', ['catalog-cards', 'catalog-corners', 'catalog-density', 'catalog-shadow', 'catalog-shadowDirection', 'catalog-border', 'catalog-material', 'catalog-glass', 'catalog-atmosphere', 'catalog-gradient']],
        ['components', ['catalog-buttons', 'catalog-inputs', 'catalog-tables', 'catalog-charts', 'catalog-modal', 'catalog-notice', 'catalog-switch', 'catalog-scroll', 'catalog-badge', 'catalog-emptyState', 'catalog-motion', 'catalog-pageTransition', 'catalog-icons']],
        ['layout', ['catalog-sidebar', 'catalog-topbar', 'catalog-contentWidth', 'global-block']],
        ['advanced', []],
    ])('a decisão %s monta os grupos de opção dela', (id, expected) => {
        expect(mounted(id)).toEqual(expected);
    });

    it('os grupos de catálogo ganham título legível; paleta e bloco global trazem o próprio', () => {
        render(<ThemeDecisionOptions groups={groupsOf('shape')} context={context} />);

        expect(screen.getByRole('heading', { level: 3, name: 'Estilo dos cards' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3, name: 'Atmosfera e textura' })).toBeInTheDocument();
    });
});
