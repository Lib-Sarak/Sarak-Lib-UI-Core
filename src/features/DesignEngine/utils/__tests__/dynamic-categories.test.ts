// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { CHROME_COMPOSITION_CATEGORY, sanitizeCategory, buildDynamicGroups, placeChromeCompositionToken } from '../dynamic-categories';
import { TokenCatalog } from '../../../../core/Design/catalog';
import type { ComponentSchema, SarakDesignToken } from '../../../../core/Design/types';

vi.mock('../../config/design-pillars.json', () => ({
    default: [
        { id: 'color-pillar', categories: ['Cores e Marca'] },
        { id: 'typography-pillar', categories: ['Tipografia'] },
        { id: 'navigation', categories: ['Layout e Navegação', 'Composição da Barra'] }
    ]
}));

describe('dynamic-categories', () => {
    it('sanitiza categorias conhecidas para o padrão do Sarak', () => {
        expect(sanitizeCategory('colors-and-atmosphere')).toBe('Cores e Marca');
        expect(sanitizeCategory('tipografia')).toBe('Tipografia');
        expect(sanitizeCategory('unknown-stuff')).toBe('Geral');
    });

    it('constrói grupos dinâmicos agrupando por pilar e subcategoria', () => {
        const masterTokens = [
            {
                id: 'base',
                tokens: [{ id: 'token1' }, { id: 'token2' }, { id: 'token3' }]
            }
        ] as unknown as ComponentSchema[];
        
        const catalogJSON = [
            { tokenId: 'token1', categories: ['cores', 'tema'] },
            { tokenId: 'token2', categories: ['tipografia'] },
            { tokenId: 'token3', categories: ['unknown'] }
        ];

        const groups = buildDynamicGroups(masterTokens, catalogJSON);
        
        expect(groups).toBeDefined();
        expect(groups['color-pillar']).toBeDefined();
    });

    it('mantém a composição da barra como seção própria da navegação', () => {
        const masterTokens = [
            { id: 'navigation', tokens: [{ id: 'chromeSearchPosition' }] }
        ] as unknown as ComponentSchema[];
        const catalogJSON = [{ tokenId: 'chromeSearchPosition', categories: ['chrome-composition'] }];

        const groups = buildDynamicGroups(masterTokens, catalogJSON);

        expect(groups.navigation['Composição da Barra']).toHaveLength(1);
        expect(groups.navigation.Geral).toBeUndefined();
    });

    it('coloca um token de composição na seção nomeada do pilar correspondente', () => {
        const token = { id: 'chromeSearchPosition' } as SarakDesignToken;
        const groups: Record<string, Record<string, SarakDesignToken[]>> = { navigation: {} };

        const handled = placeChromeCompositionToken(groups, token, [CHROME_COMPOSITION_CATEGORY]);

        expect(handled).toBe(true);
        expect(groups.navigation[CHROME_COMPOSITION_CATEGORY]).toEqual([token]);
    });

    it('inclui os oito tokens reais da composição no conjunto Essencial do painel', () => {
        const catalogEntries = TokenCatalog as unknown as {
            tokenId: string;
            categories?: string[];
            importance?: number;
        }[];
        const compositionTokens = catalogEntries.filter((token) =>
            token.categories?.includes('chrome-composition'),
        );
        const essentialTokenIds = new Set(
            catalogEntries
                .filter((token) => (token.importance || 0) >= 80)
                .map((token) => token.tokenId),
        );

        expect(compositionTokens).toHaveLength(8);
        expect(compositionTokens.filter((token) => !essentialTokenIds.has(token.tokenId))).toEqual([]);
    });
});
