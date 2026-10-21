import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIOptions } from '../../../../core/Provider/types';
import { useChromeRootBackground } from '../useChromeRootBackground';

const OPACO = 'var(--bg-body, var(--theme-body, transparent))';

afterEach(() => localStorage.clear());

const backgroundUnder = (config: Record<string, unknown>, options?: SarakUIOptions): string => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SarakUIProvider config={config} options={options}>{children}</SarakUIProvider>
    );
    return renderHook(() => useChromeRootBackground(), { wrapper }).result.current;
};

describe('useChromeRootBackground', () => {
    it('sem Provider não há atmosfera por baixo: a raiz pinta o fundo do tema', () => {
        expect(renderHook(() => useChromeRootBackground()).result.current).toBe(OPACO);
    });

    it('em Modo App o `body` pinta gradiente, tom e textura: a raiz fica transparente para deixá-los passar', () => {
        expect(backgroundUnder({})).toBe('transparent');
        expect(backgroundUnder({}, { mode: 'app' })).toBe('transparent');
    });

    it('em Modo Embarcado o `body` é o do host: a raiz mantém o fundo do tema', () => {
        expect(backgroundUnder({}, { mode: 'embedded' })).toBe(OPACO);
    });

    it('com mídia de fundo global a raiz fica transparente, em qualquer modo', () => {
        const config = { globalBackgroundImageUrl: 'https://exemplo.com/bg.png' };
        expect(backgroundUnder(config)).toBe('transparent');
        expect(backgroundUnder(config, { mode: 'embedded' })).toBe('transparent');
    });
});
