import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as HookModule from '../useShellLayoutStyles';
import { useShellLayoutStyles } from '../useShellLayoutStyles';
import { BREAKPOINT_DESKTOP } from '../../../Design/breakpoints';

describe('useShellLayoutStyles', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
        // TODO: Escrever testes comportamentais para este hook
    });

    it('mainContentClass (contentAlignment "center") usa @min-[640px]/@min-[1024px] LITERAIS — o segundo é o MESMO número de BREAKPOINT_DESKTOP (plan-39)', () => {
        const { result } = renderHook(() => useShellLayoutStyles({ contentAlignment: 'center' } as any));
        expect(result.current.mainContentClass).toContain('@min-[640px]:px-6');
        expect(result.current.mainContentClass).toContain(`@min-[${BREAKPOINT_DESKTOP}px]:px-8`);
    });
});
