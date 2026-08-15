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

    // plan-47: sem `templateColumns`, o SarakGrid caía em `col-12` (doze trilhas de
    // 1/12, um filho por trilha, sem mecanismo de span) — o defeito relatado com a
    // tela na mão (aba Propostas do ERP). Prova só a CLASSE emitida (não mais
    // `grid-cols-12`, agora `auto-fit`); NÃO prova quantas colunas o browser desenha
    // em cada largura — jsdom não tem motor de layout (medição real em Chromium,
    // colada no resumo da plan-47).
    it('sem nenhuma prop, NÃO emite mais a malha de 12 trilhas — emite a forma content-aware (auto-fit)', () => {
        const { container } = render(
            <SarakGrid>
                <div>a</div>
                <div>b</div>
            </SarakGrid>
        );

        const wrapper = container.firstElementChild as HTMLElement;
        const grid = wrapper.firstElementChild as HTMLElement;
        expect(grid.className).toContain('grid-cols-[repeat(auto-fit,minmax(280px,1fr))]');
        expect(grid.className).not.toContain('grid-cols-12');
    });

    // plan-47 critério de aceite: `templateColumns` explícito CONTINUA vencendo a
    // estratégia do tema (auto-fit/col-12/masonry) — o consumidor que já controla o
    // próprio grid não é afetado pela mudança de default.
    it('com templateColumns explícito, a prop do consumidor CONTINUA vencendo a estratégia do tema', () => {
        const { container } = render(
            <SarakGrid templateColumns="1fr 2fr 1fr">
                <div>a</div>
            </SarakGrid>
        );

        const wrapper = container.firstElementChild as HTMLElement;
        const grid = wrapper.firstElementChild as HTMLElement;
        expect(grid.style.gridTemplateColumns).toBe('1fr 2fr 1fr');
        expect(grid.className).not.toContain('grid-cols-[repeat(auto-fit');
        expect(grid.className).not.toContain('grid-cols-12');
    });
});
