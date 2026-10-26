import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DesignOverrideContext, UIContext } from '../context';
import type { SarakUIContextType } from '../types';
import { useNavigationAppearance } from '../useNavigationAppearance';

const wrapperWithDesign = (design: Record<string, unknown>, override?: Record<string, unknown>) => {
    const context = { design } as unknown as SarakUIContextType;
    return ({ children }: { children: React.ReactNode }) => (
        <UIContext.Provider value={context}>
            <DesignOverrideContext.Provider value={override ? override as never : null}>
                {children}
            </DesignOverrideContext.Provider>
        </UIContext.Provider>
    );
};

describe('useNavigationAppearance', () => {
    it('usa os estilos padrão do schema sem exigir Provider', () => {
        const { result } = renderHook(() => useNavigationAppearance());
        expect(result.current).toEqual({
            sidebarBorderStyle: 'solid',
            sidebarBorderSide: 'edge',
            sidebarBackgroundStyle: 'solid',
            sidebarActiveItemStyle: 'bar',
            sidebarItemDensity: 'comfortable',
            topbarBorderStyle: 'solid',
            topbarBorderSide: 'edge',
            topbarBackgroundStyle: 'solid',
            topbarActiveItemStyle: 'bar',
            topbarItemDensity: 'comfortable',
        });
    });

    it('lê as opções estruturais de cada barra e ignora valores fora do contrato', () => {
        const { result } = renderHook(() => useNavigationAppearance(), {
            wrapper: wrapperWithDesign({
                sidebarBorderStyle: 'dashed',
                sidebarBorderSide: 'all',
                sidebarBackgroundStyle: 'texture',
                sidebarActiveItemStyle: 'filled',
                sidebarItemDensity: 'compact',
                topbarBorderStyle: 'double',
                topbarBorderSide: 'left',
                topbarBackgroundStyle: 'gradient',
                topbarActiveItemStyle: 'outline',
                topbarItemDensity: 'spacious',
            }),
        });
        expect(result.current).toEqual({
            sidebarBorderStyle: 'dashed',
            sidebarBorderSide: 'all',
            sidebarBackgroundStyle: 'texture',
            sidebarActiveItemStyle: 'filled',
            sidebarItemDensity: 'compact',
            topbarBorderStyle: 'double',
            topbarBorderSide: 'left',
            topbarBackgroundStyle: 'gradient',
            topbarActiveItemStyle: 'outline',
            topbarItemDensity: 'spacious',
        });
    });

    it('aplica o rascunho de tema sobre o design persistido', () => {
        const { result } = renderHook(() => useNavigationAppearance(), {
            wrapper: wrapperWithDesign({ sidebarActiveItemStyle: 'bar' }, { sidebarActiveItemStyle: 'pill' }),
        });
        expect(result.current.sidebarActiveItemStyle).toBe('pill');
    });
});
