import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../SarakManagementGrid';

// Isola o denso da rede — só interessa a montagem, não o dado (mesmo idioma de
// SarakTable.responsive.test.tsx).
vi.mock('../hooks/useManagementGrid', () => ({
    useManagementGrid: () => ({
        groups: {},
        loading: false,
        activeModal: null,
        setActiveModal: () => undefined,
        load: () => undefined,
        handleToggle: () => undefined,
        handleDelete: () => undefined,
        handleAction: () => undefined,
    }),
}));

import { SarakManagementGrid } from '../SarakManagementGrid';

describe('SarakManagementGrid', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: `headerLayout`/`gridLayout` usam classe `@min-[…]` (container query),
    // que só ativa com um ancestral `container-type`. jsdom não avalia container
    // query — prova só que a raiz PLANTA `@container` (a query casar é prova de
    // browser real, plan-40).
    it('planta @container na raiz — ancestral do grid de grupos', () => {
        const { container } = render(
            <SarakManagementGrid endpoint="/mock" groupBy="service" mapping={{ id: 'id', title: 'title', status: 'status', isActive: 'isActive' }} />
        );

        expect(container.querySelector('[class*="@container"]')).not.toBeNull();
    });
});
