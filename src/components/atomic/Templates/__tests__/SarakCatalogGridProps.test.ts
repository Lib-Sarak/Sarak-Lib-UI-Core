import { describe, expect, it } from 'vitest';
import type { SarakCatalogItem, SarakCatalogGridProps } from '../SarakCatalogGridProps';

describe('SarakCatalogGridProps', () => {
    it('mantém itens e cartão customizado tipados', () => {
        const item: SarakCatalogItem = {
            id: 'item-1',
            display_name: 'Item de exemplo',
            category: 'modelos',
        };
        const props = {
            items: [item],
            title: 'Catálogo',
            categories: { all: 'Todos', modelos: 'Modelos' },
            renderCard: (catalogItem: SarakCatalogItem) => catalogItem.display_name,
        } satisfies SarakCatalogGridProps;

        expect(props.items).toEqual([item]);
        expect(props.renderCard(item)).toBe('Item de exemplo');
    });
});
