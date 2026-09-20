import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResponsiveStyles } from '../useResponsiveStyles';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../../../core/Design/breakpoints';

describe('useResponsiveStyles', () => {
    it('should be defined and return both functions', () => {
        const { result } = renderHook(() => useResponsiveStyles());
        expect(result.current).toBeDefined();
        expect(result.current.getResponsiveSpacingStyles).toBeDefined();
        expect(result.current.getResponsiveStackStyles).toBeDefined();
    });

    it('getResponsiveSpacingStyles retorna className para preset válido', () => {
        const { result } = renderHook(() => useResponsiveStyles());
        const styles = result.current.getResponsiveSpacingStyles('expandableCardBody');
        expect(styles.className).toContain('p-');
    });

    it('getResponsiveStackStyles retorna className e style com gap', () => {
        const { result } = renderHook(() => useResponsiveStyles());
        const styles = result.current.getResponsiveStackStyles('md');
        expect(styles.className).toContain('flex');
        expect(styles.style?.gap).toBeTruthy();
    });

    it('getResponsiveStackStyles: `md` e `lg` usam os MESMOS números de BREAKPOINT_TABLET/DESKTOP', () => {
        const { result } = renderHook(() => useResponsiveStyles());
        expect(result.current.getResponsiveStackStyles('md').className).toBe(
            `flex flex-col @min-[${BREAKPOINT_TABLET}px]:flex-row`,
        );
        expect(result.current.getResponsiveStackStyles('lg').className).toBe(
            `flex flex-col @min-[${BREAKPOINT_DESKTOP}px]:flex-row`,
        );
    });

    it('getResponsiveStackStyles aceita breakpoint lg', () => {
        const { result } = renderHook(() => useResponsiveStyles());
        const styles = result.current.getResponsiveStackStyles('lg');
        expect(styles.className).toContain('@min-[1024px]');
    });
});
