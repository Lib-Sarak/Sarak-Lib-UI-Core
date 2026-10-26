import { describe, expect, it } from 'vitest';
import { NavigationSchema } from '../navigation';

const tokensById = Object.fromEntries(NavigationSchema.tokens.map((token) => [token.id, token]));

describe('NavigationSchema — tokens de identidade da barra', () => {
    it.each([
        'sidebarItemTextColor', 'sidebarItemHoverTextColor', 'sidebarCategoryColor', 'sidebarBrandColor',
        'topbarItemTextColor', 'topbarItemHoverTextColor', 'topbarBrandColor',
        'sidebarBorderColor', 'sidebarBorderWidth', 'sidebarBorderStyle', 'sidebarBorderSide',
        'topbarBorderColor', 'topbarBorderWidth', 'topbarBorderStyle', 'topbarBorderSide',
        'topbarBlur', 'topbarShadow', 'topbarGroupSeparatorColor',
        'sidebarBrandBackground', 'sidebarFooterBackground', 'topbarBrandBackground',
        'sidebarBackgroundStyle', 'topbarBackgroundStyle', 'sidebarActiveItemStyle', 'topbarActiveItemStyle',
        'sidebarItemDensity', 'topbarItemDensity', 'sidebarIconSize', 'sidebarIconColor', 'topbarIconSize', 'topbarIconColor',
    ])('%s tem metadados e leitor declarado no schema', (id) => {
        const token = tokensById[id];
        expect(token, `token ausente: ${id}`).toBeDefined();
        expect(token.label.trim()).not.toBe('');
        expect(token.description?.trim()).not.toBe('');
        expect(token.usage?.trim()).not.toBe('');
        expect(token.cssVars?.length || token.structuralConsumer?.length).toBeTruthy();
    });

    it('oferece os cinco estilos do item ativo e preserva o marcador atual como padrão', () => {
        for (const id of ['sidebarActiveItemStyle', 'topbarActiveItemStyle']) {
            const token = tokensById[id];
            expect(token.constraints?.options?.map((option) => option.value)).toEqual([
                'bar', 'pill', 'underline', 'filled', 'outline',
            ]);
            expect(token.defaultValue).toBe('bar');
        }
    });

    it('oferece as três densidades, os tratamentos de fundo e as opções sem borda', () => {
        for (const id of ['sidebarItemDensity', 'topbarItemDensity']) {
            expect(tokensById[id].constraints?.options?.map((option) => option.value)).toEqual([
                'compact', 'comfortable', 'spacious',
            ]);
        }
        for (const id of ['sidebarBackgroundStyle', 'topbarBackgroundStyle']) {
            expect(tokensById[id].constraints?.options?.map((option) => option.value)).toEqual([
                'solid', 'gradient', 'texture',
            ]);
        }
        for (const id of ['sidebarBorderStyle', 'topbarBorderStyle']) {
            expect(tokensById[id].constraints?.options?.map((option) => option.value)).toContain('none');
        }
    });
});
