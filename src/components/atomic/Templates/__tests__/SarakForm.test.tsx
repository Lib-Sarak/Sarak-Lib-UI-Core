import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as ComponentModule from '../SarakForm';
import { SarakForm } from '../SarakForm';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';

const withColTwelveTheme: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
    React.createElement(
        UIContext.Provider,
        { value: ({ design: { layoutGridTemplate: 'col-12' } }) as unknown as SarakUIContextType },
        children,
    );

describe('SarakForm', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
        // TODO: Injetar testes de montagem profunda caso o componente cresça em complexidade
    });

    // plan-47: o `<SarakGrid>` interno de campos (:80) não recebe `templateColumns` —
    // caía em `col-12`, cada campo em 1/12 da largura (~55px de input, citado na
    // plan). `mode="create"` evita a chamada de rede do `useFormData` (não precisa
    // mockar `api`). Prova só a CLASSE emitida (não mais `grid-cols-12`, agora
    // `auto-fit`); NÃO prova largura real de campo — jsdom não tem motor de layout
    // (medição real em Chromium, no resumo da plan-47).
    it('o grid de campos do formulário NÃO emite mais a forma quebrada (col-12) — emite auto-fit', () => {
        const { container } = render(
            <SarakForm endpoint="/mock" mapping={{ name: 'Nome' }} mode="create" />
        );

        const grid = container.querySelector('[class*="@container"]')?.firstElementChild as HTMLElement;
        expect(grid.className).toContain('grid-cols-[repeat(auto-fit,minmax(280px,1fr))]');
        expect(grid.className).not.toContain('grid-cols-12');
    });

    // plan-49: sob `col-12` (escolha explícita de tema), o grid de campos não emite mais
    // a forma SEM mecanismo de span — emite o default de span por breakpoint. Prova só a
    // classe emitida; NÃO prova largura real (medição em Chromium no resumo da plan-49).
    it('sob col-12 (escolha explícita de tema), o grid de campos emite o default de span — não mais a forma sem span nenhum', () => {
        const { container } = render(
            <SarakForm endpoint="/mock" mapping={{ name: 'Nome' }} mode="create" />,
            { wrapper: withColTwelveTheme },
        );

        const grid = container.querySelector('[class*="@container"]')?.firstElementChild as HTMLElement;
        expect(grid.className).toContain('grid-cols-12');
        expect(grid.className).toContain('[:where(&)>*]:col-span-6');
    });
});
