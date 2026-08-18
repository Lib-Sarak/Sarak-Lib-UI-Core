import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as HookModule from '../useStructuralStyles';
import { useStructuralStyles } from '../useStructuralStyles';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../../../core/Design/breakpoints';
import { BP_XL } from '../useStructuralStyles.presets';
import type { SarakUIContextType } from '../../../../core/Provider/types';

const uiContextValue = (design: Record<string, unknown>): SarakUIContextType =>
    ({ design }) as unknown as SarakUIContextType;

describe('useStructuralStyles', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
        // TODO: Escrever testes comportamentais para este hook
    });

    // plan-47: o default deixou de ser 'col-12' (12 trilhas de 1/12, sem mecanismo de
    // span) — passou a ser 'auto-fit', content-aware, resolvido pelo próprio CSS Grid
    // (sem depender de container query). Prova só a CLASSE emitida; não prova quantas
    // colunas o browser desenha em cada largura — jsdom não tem motor de layout
    // (medição real em Chromium, colada no resumo da plan-47).
    it('renderiza sem SarakUIProvider, com o novo default de grid aplicado (auto-fit, não mais col-12)', () => {
        const Probe: React.FC = () => {
            const { getGridStyles } = useStructuralStyles();
            const { className } = getGridStyles();
            return React.createElement('span', { 'data-testid': 'grid-class' }, className);
        };
        expect(() => render(React.createElement(Probe))).not.toThrow();
        expect(screen.getByTestId('grid-class')).toHaveTextContent('grid-cols-[repeat(auto-fit,minmax(280px,1fr))]');
        expect(screen.getByTestId('grid-class')).not.toHaveTextContent('grid-cols-12');
    });

    describe('classes de container query são literais para o scanner do Tailwind (plan-39)', () => {
        it('getGridStyles: SEM tema (default), usa auto-fit — plan-47, não mais col-12', () => {
            const { result } = renderHook(() => useStructuralStyles());
            expect(result.current.getGridStyles().className).toBe(
                'grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))]',
            );
        });

        // plan-49: `col-12` continua sendo 12 trilhas fixas, mas o filho SEM span próprio
        // agora ganha um default por breakpoint (`col-span-N`), com os MESMOS números de
        // BREAKPOINT_TABLET/DESKTOP/BP_XL, escritos literais — o número do breakpoint
        // continua sendo o que a `plan-39` protege. Prova só a FORMA da classe emitida —
        // não prova que o filho SEM span recebe o default nem que um filho COM span vence
        // o pai (isso é resolução de especificidade em cascata CSS real; jsdom não
        // implementa motor de layout nem cascata de stylesheet — medição real em
        // Chromium, colada no resumo da plan-49).
        it('getGridStyles: col-12 continua disponível como ESCOLHA de tema (explícita), com default de span por breakpoint, nos MESMOS números literais', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
                React.createElement(UIContext.Provider, { value: uiContextValue({ layoutGridTemplate: 'col-12' }) }, children);
            const { result } = renderHook(() => useStructuralStyles(), { wrapper });
            expect(result.current.getGridStyles().className).toBe(
                `grid w-full grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-12 ` +
                `@min-[${BREAKPOINT_TABLET}px]:[:where(&)>*]:col-span-6 ` +
                `@min-[${BREAKPOINT_DESKTOP}px]:[:where(&)>*]:col-span-4 ` +
                `@min-[${BP_XL}px]:[:where(&)>*]:col-span-3`,
            );
        });

        // plan-49: o default de span do `col-12` só se aplica quando `getGridStyles` NÃO
        // recebe `templateColumns`/`templateAreas` (mesmo ramo `hasCustomTemplate` de
        // sempre) — um consumidor que já controla o próprio grid de 12 colunas com
        // `templateColumns` explícito continua recebendo só `'grid w-full'`, sem o
        // default de span entrar no meio.
        it('getGridStyles: com templateColumns explícito, o default de span do col-12 NÃO entra — a forma continua "grid w-full"', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
                React.createElement(UIContext.Provider, { value: uiContextValue({ layoutGridTemplate: 'col-12' }) }, children);
            const { result } = renderHook(() => useStructuralStyles(), { wrapper });
            expect(result.current.getGridStyles('repeat(12, minmax(0, 1fr))').className).toBe('grid w-full');
        });

        it('getGridStyles: masonry usa os MESMOS números de BREAKPOINT_TABLET/DESKTOP, escritos literais', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
                React.createElement(UIContext.Provider, { value: uiContextValue({ layoutGridTemplate: 'masonry' }) }, children);
            const { result } = renderHook(() => useStructuralStyles(), { wrapper });
            expect(result.current.getGridStyles().className).toBe(
                `columns-1 @min-[${BREAKPOINT_TABLET}px]:columns-2 @min-[${BREAKPOINT_DESKTOP}px]:columns-3 w-full`,
            );
        });

        it('getResponsiveStackStyles: `md` e `lg` usam os MESMOS números de BREAKPOINT_TABLET/DESKTOP', () => {
            const { result } = renderHook(() => useStructuralStyles());
            expect(result.current.getResponsiveStackStyles('md').className).toBe(
                `flex flex-col @min-[${BREAKPOINT_TABLET}px]:flex-row`,
            );
            expect(result.current.getResponsiveStackStyles('lg').className).toBe(
                `flex flex-col @min-[${BREAKPOINT_DESKTOP}px]:flex-row`,
            );
        });

        it('getHeaderStyles usa o MESMO número de BREAKPOINT_TABLET, escrito literal', () => {
            const { result } = renderHook(() => useStructuralStyles());
            expect(result.current.getHeaderStyles().className).toBe(
                `flex flex-col @min-[${BREAKPOINT_TABLET}px]:flex-row @min-[${BREAKPOINT_TABLET}px]:items-center w-full justify-between`,
            );
        });
    });

    // plan-48: o piso de célula do auto-fit (antes 280px fixo em GRID_LAYOUT_STRATEGIES)
    // agora é o token `layoutGridMinCell`, que chega ao CSS por `style.gridTemplateColumns`
    // — não por `var()` dentro da classe Tailwind (o valor arbitrário é resolvido em
    // build-time e não aceita variável). Estes testes provam que a STRING emitida em
    // `style` muda com o token; NÃO provam quantas colunas o browser desenha, nem que o
    // `style` de fato vence a classe na cascata real — isso é CSS e foi medido em
    // Chromium real (resumo da plan-48): com a MESMA classe (`minmax(280px,1fr)`) e um
    // container de 900px, `style` ausente ou repetindo 280 dá 3 colunas de 300px; `style`
    // com 400 dá 2 colunas de 450px — a inline style sempre vence.
    describe('token layoutGridMinCell (plan-48) — o piso do grid auto-fit deixou de ser um literal fixo', () => {
        it('SEM tema: o style.gridTemplateColumns resolve para o default (280px) — nenhuma mudança silenciosa de aparência', () => {
            const { result } = renderHook(() => useStructuralStyles());
            expect(result.current.getGridStyles().style.gridTemplateColumns).toBe(
                'repeat(auto-fit, minmax(280px, 1fr))',
            );
        });

        it('com layoutGridMinCell no tema, o style.gridTemplateColumns emitido muda para o valor do token', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
                React.createElement(UIContext.Provider, { value: uiContextValue({ layoutGridMinCell: 400 }) }, children);
            const { result } = renderHook(() => useStructuralStyles(), { wrapper });
            expect(result.current.getGridStyles().style.gridTemplateColumns).toBe(
                'repeat(auto-fit, minmax(400px, 1fr))',
            );
        });

        it('a CLASSE não muda com o token — só o style; a forma "grid-cols-[...280px...]" continua a mesma', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
                React.createElement(UIContext.Provider, { value: uiContextValue({ layoutGridMinCell: 400 }) }, children);
            const { result } = renderHook(() => useStructuralStyles(), { wrapper });
            expect(result.current.getGridStyles().className).toBe(
                'grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))]',
            );
        });

        it('com templateColumns explícito, o token NÃO entra — templateColumns sempre vence (hasCustomTemplate)', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
                React.createElement(UIContext.Provider, { value: uiContextValue({ layoutGridMinCell: 400 }) }, children);
            const { result } = renderHook(() => useStructuralStyles(), { wrapper });
            expect(result.current.getGridStyles('repeat(6, 1fr)').style.gridTemplateColumns).toBe('repeat(6, 1fr)');
        });

        it('em col-12/masonry, o token não se aplica — style.gridTemplateColumns continua ausente', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
                React.createElement(
                    UIContext.Provider,
                    { value: uiContextValue({ layoutGridTemplate: 'col-12', layoutGridMinCell: 400 }) },
                    children,
                );
            const { result } = renderHook(() => useStructuralStyles(), { wrapper });
            expect(result.current.getGridStyles().style.gridTemplateColumns).toBeUndefined();
        });
    });
});
