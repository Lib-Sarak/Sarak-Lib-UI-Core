import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../SarakGrid';
import { SarakGrid } from '../SarakGrid';

describe('SarakGrid', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-41: as classes de container query que `getGridStyles` produz — prefixo
    // `@min-[` + medida + `]:` seguido do utilitário, ex.: `grid-cols-12` — são
    // container query e só ativam com um ancestral `container-type`. jsdom NÃO tem
    // motor de layout e não avalia `@container`, então este teste prova só que o
    // WRAPPER com a classe `@container` foi PLANTADO como ancestral do grid — nunca
    // que a query casou (isso só se prova num browser real, plan-40).
    // ⚠️ plan-44: NÃO junte o prefixo e o utilitário acima num texto contínuo — foi
    // essa junção (com `…` no lugar da medida) que derrubou `npm run build` duas
    // vezes. Ver SarakGrid.tsx:57 para o mesmo aviso, por extenso.
    it('planta um wrapper @container como ancestral do grid (não prova que a query casa — jsdom não avalia container query)', () => {
        const { container } = render(
            <SarakGrid>
                <div>item</div>
            </SarakGrid>
        );

        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain('@container');

        const grid = wrapper.firstElementChild as HTMLElement;
        expect(grid.className).toContain('grid');
        expect(grid.className).not.toContain('@container');
    });
});
