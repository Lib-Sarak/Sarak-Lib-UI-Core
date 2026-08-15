import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as HookModule from '../useStructuralStyles';
import { useStructuralStyles } from '../useStructuralStyles';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../../../core/Design/breakpoints';
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

        it('getGridStyles: col-12 continua disponível como ESCOLHA de tema (explícita) e usa o MESMO número de BREAKPOINT_TABLET, escrito literal', () => {
            const wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
                React.createElement(UIContext.Provider, { value: uiContextValue({ layoutGridTemplate: 'col-12' }) }, children);
            const { result } = renderHook(() => useStructuralStyles(), { wrapper });
            expect(result.current.getGridStyles().className).toBe(
                `grid w-full grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-12`,
            );
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
});
