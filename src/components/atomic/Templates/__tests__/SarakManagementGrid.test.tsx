import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../SarakManagementGrid';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';

const withColTwelveTheme: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
    React.createElement(
        UIContext.Provider,
        { value: ({ design: { layoutGridTemplate: 'col-12' } }) as unknown as SarakUIContextType },
        children,
    );

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

    // plan-47: `getGridStyles()` sem templateColumns/preset caía em `col-12` — cada
    // grupo em 1/12 da largura. Prova só a CLASSE emitida no grid de grupos (não
    // mais `grid-cols-12`, agora `auto-fit`); NÃO prova largura real de coluna —
    // jsdom não tem motor de layout (medição real em Chromium, no resumo da plan-47).
    it('o grid de grupos NÃO emite mais a forma quebrada (col-12) — emite auto-fit', () => {
        const { container } = render(
            <SarakManagementGrid endpoint="/mock" groupBy="service" mapping={{ id: 'id', title: 'title', status: 'status', isActive: 'isActive' }} />
        );

        const grid = container.querySelector('[class*="@container"]')?.lastElementChild as HTMLElement;
        expect(grid.className).toContain('grid-cols-[repeat(auto-fit,minmax(280px,1fr))]');
        expect(grid.className).not.toContain('grid-cols-12');
    });

    // plan-49: sob `col-12` (escolha explícita de tema), o grid de grupos não emite mais
    // a forma SEM mecanismo de span — emite o default de span por breakpoint. Prova só a
    // classe emitida; NÃO prova largura real (medição em Chromium no resumo da plan-49).
    it('sob col-12 (escolha explícita de tema), o grid de grupos emite o default de span — não mais a forma sem span nenhum', () => {
        const { container } = render(
            <SarakManagementGrid endpoint="/mock" groupBy="service" mapping={{ id: 'id', title: 'title', status: 'status', isActive: 'isActive' }} />,
            { wrapper: withColTwelveTheme },
        );

        const grid = container.querySelector('[class*="@container"]')?.lastElementChild as HTMLElement;
        expect(grid.className).toContain('grid-cols-12');
        expect(grid.className).toContain('[:where(&)>*]:col-span-6');
    });
});
