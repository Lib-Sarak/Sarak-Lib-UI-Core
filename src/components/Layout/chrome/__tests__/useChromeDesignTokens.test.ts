import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useChromeDesignTokens } from '../useChromeDesignTokens';
import { UIContext } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';

const wrapperWithDesign = (design: Record<string, unknown>) => {
    const context = { design } as unknown as SarakUIContextType;
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(UIContext.Provider, { value: context }, children);
};

describe('useChromeDesignTokens', () => {
    it('fora do Provider, degrada para os defaults do schema — nunca lança', () => {
        const { result } = renderHook(() => useChromeDesignTokens());
        expect(result.current).toEqual({
            sidebarPosition: 'left',
            navbarLayout: 'sticky',
            contentAlignment: 'stretch',
            layoutDensity: 'comfortable',
            maxContentWidth: '1440px',
            isNavHidden: false,
            isAutoHideEnabled: false,
            searchPositionSidebar: 'top',
            searchPositionTopbar: 'left',
        });
    });

    it('sem o design definir o token, cai no default do schema (não em undefined)', () => {
        const { result } = renderHook(() => useChromeDesignTokens(), { wrapper: wrapperWithDesign({}) });
        expect(result.current.sidebarPosition).toBe('left');
        expect(result.current.layoutDensity).toBe('comfortable');
        expect(result.current.maxContentWidth).toBe('1440px');
        expect(result.current.isNavHidden).toBe(false);
    });

    it('lê cada token do design quando presente', () => {
        const { result } = renderHook(() => useChromeDesignTokens(), {
            wrapper: wrapperWithDesign({
                sidebarPosition: 'right',
                navbarLayout: 'hidden',
                contentAlignment: 'center',
                layoutDensity: 'spacious',
                maxContentWidth: '1200px',
                isNavHidden: true,
                isAutoHideEnabled: true,
                searchPositionSidebar: 'bottom',
                searchPositionTopbar: 'right',
            }),
        });
        expect(result.current).toEqual({
            sidebarPosition: 'right',
            navbarLayout: 'hidden',
            contentAlignment: 'center',
            layoutDensity: 'spacious',
            maxContentWidth: '1200px',
            isNavHidden: true,
            isAutoHideEnabled: true,
            searchPositionSidebar: 'bottom',
            searchPositionTopbar: 'right',
        });
    });

    it('valor legado "hidden" na sidebar degrada para a posição padrão "top"', () => {
        const { result } = renderHook(() => useChromeDesignTokens(), {
            wrapper: wrapperWithDesign({ searchPositionSidebar: 'hidden' }),
        });
        expect(result.current.searchPositionSidebar).toBe('top');
    });
});
