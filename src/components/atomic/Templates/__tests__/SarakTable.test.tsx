import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../SarakTable';

// Isola o denso da rede — mesmo idioma de SarakTable.responsive.test.tsx.
vi.mock('../hooks/useSarakTableData', () => ({
    useSarakTableData: () => ({
        data: [],
        filteredData: [],
        loading: false,
        error: null,
        search: '',
        setSearch: () => undefined,
        fetchData: () => undefined,
    }),
}));

import { SarakTable } from '../SarakTable';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

describe('SarakTable', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: `headerLayout` usa classe `@min-[…]` (container query), que só ativa
    // com um ancestral `container-type`. jsdom não avalia container query — prova só
    // que a raiz PLANTA `@container` (a query casar é prova de browser real, plan-40).
    it('planta @container na raiz — ancestral do cabeçalho responsivo', () => {
        const { container } = render(
            <SarakUIProvider>
                <SarakTable endpoint="/mock" mapping={{ nome: 'Nome' }} />
            </SarakUIProvider>
        );

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });
});
