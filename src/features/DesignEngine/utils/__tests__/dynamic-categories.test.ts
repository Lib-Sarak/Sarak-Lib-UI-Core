// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { sanitizeCategory, buildDynamicGroups } from '../dynamic-categories';
import type { ComponentSchema } from '../../../../core/Design/types';

vi.mock('../../config/design-pillars.json', () => ({
    default: [
        { id: 'color-pillar', categories: ['Cores e Marca'] },
        { id: 'typography-pillar', categories: ['Tipografia'] }
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
});
