import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../SarakCatalogGrid';
import { SarakCatalogGrid } from '../SarakCatalogGrid';

describe('SarakCatalogGrid', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: `headerLayout`/`gridLayout`/`searchRow` usam classe `@min-[…]`
    // (container query), que só ativa com um ancestral `container-type`. jsdom não
    // avalia container query — prova só que a raiz PLANTA `@container` (a query casar
    // é prova de browser real, plan-40).
    it('planta @container na raiz — ancestral do grid, do cabeçalho e da fileira de busca', () => {
        const { container } = render(<SarakCatalogGrid items={[]} title="Catálogo" />);

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });
});
