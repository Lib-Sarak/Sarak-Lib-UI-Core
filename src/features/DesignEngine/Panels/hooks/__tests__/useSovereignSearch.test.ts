import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { SarakDesignState } from '../../../../../core/Provider/types';
import { MASTER_DESIGN_MAP } from '../../../../../core/Design/master-map';
import { TokenCatalog } from '../../../../../core/Design/catalog';
import DesignPillars from '../../../config/design-pillars.json';
import { SOVEREIGN_PILLARS, useSovereignSearch } from '../useSovereignSearch';

const search = (query: string, activePillar = 'typography') =>
    renderHook(() => useSovereignSearch({}, query, activePillar)).result.current.filteredComponents;

const NEW_CATALOG_TOKEN_IDS = [
    'tableZebraStriping', 'tableBorderRadius', 'inputPadding', 'inputBorderType', 'inputBackdropBlur', 'inputShadow',
    'inputIconColor', 'inputErrorColor', 'iconButtonGlowBlurSm', 'iconButtonGlowBlurMd', 'iconButtonGlowBlurLg',
    'iconButtonFrostedShadowOffsetY', 'iconButtonFrostedShadowBlur', 'actionGlowShadowOffsetY', 'actionGlowShadowBlur',
    'actionGlowShadowSpread', 'kanbanHeaderPaddingY', 'kanbanHeaderTracking', 'kanbanCardRadius', 'toastMinWidth',
    'toastMaxWidth', 'toastAccentWidth', 'contextMenuMinWidth', 'multiSelectInputMinWidth', 'searchBackdropBlur',
    'rangeActiveColor',
];

interface CatalogSearchHarness {
    getName(tokenId: string): string;
    findToken(name: string): string[];
}

function createCatalogSearchHarness(): CatalogSearchHarness {
    const schemaLabels = new Map(MASTER_DESIGN_MAP.components.flatMap((component) =>
        component.tokens.map((token) => [token.id, token.label] as const)));
    const catalogNames = new Map(TokenCatalog.map((entry) => [entry.tokenId, entry.name]));
    const { result, rerender } = renderHook(
        ({ query }: { query: string }) => useSovereignSearch({}, query, 'brand'),
        { initialProps: { query: '' } },
    );

    return {
        getName(tokenId: string): string {
            const schemaLabel = schemaLabels.get(tokenId);
            const catalogName = catalogNames.get(tokenId);
            expect(schemaLabel).toBeDefined();
            expect(catalogName).toBe(schemaLabel);
            return catalogName ?? '';
        },
        findToken(name: string): string[] {
            rerender({ query: name });
            return result.current.filteredComponents.flatMap((component) =>
                component.tokens.map((token) => token.id));
        },
    };
}

describe('useSovereignSearch', () => {
    it('com busca, ignora o pilar e acha por sentido: `escrita` traz as fontes', () => {
        const ids = search('escrita').flatMap((component) => component.tokens.map((token) => token.id));
        expect(ids).toEqual(expect.arrayContaining(['headingFont', 'bodyFont', 'monoFont']));
    });

    it('acha pelo nome do catálogo que a tela mostra: `logo` acha identityAlignment', () => {
        const ids = search('logo').flatMap((component) => component.tokens.map((token) => token.id));
        expect(ids).toContain('identityAlignment');
    });

    it('componente cujo rótulo casa aparece no resultado com os tokens que casaram', () => {
        const component = search('typography').find((item) => item.id === 'typography');
        expect(component?.tokens.map((token) => token.id)).toContain('headingFont');
    });

    it('sem busca, filtra pelo pilar ativo', () => {
        const ids = search('').flatMap((component) => component.tokens.map((token) => token.id));
        expect(ids).toContain('headingFont');
        expect(ids).not.toContain('primaryColor');
    });

    it('usa os mesmos ids e nomes dos pilares configurados na tela principal', () => {
        expect(SOVEREIGN_PILLARS.map(({ id, label }) => ({ id, label }))).toEqual(
            DesignPillars.map(({ id, title }) => ({ id, label: title })),
        );
    });

    it('marca como alterado o pilar do token do rascunho', () => {
        const draft = { headingFont: 'Inter' } as Partial<SarakDesignState>;
        const { result } = renderHook(() => useSovereignSearch(draft, '', 'typography'));
        expect(result.current.pillarsWithDrafts).toContain('typography');
    });

    it('consulta sem resultado devolve lista vazia', () => {
        expect(search('xyzq')).toEqual([]);
    });
});

describe('novos nomes do catálogo no painel', () => {
    it('são os labels do schema e a busca acha os 26 tokens', () => {
        const catalogSearch = createCatalogSearchHarness();
        for (const tokenId of NEW_CATALOG_TOKEN_IDS) {
            const catalogName = catalogSearch.getName(tokenId);
            expect(catalogSearch.findToken(catalogName), `busca pelo nome do catálogo: ${catalogName}`).toContain(tokenId);
        }
    });
});
