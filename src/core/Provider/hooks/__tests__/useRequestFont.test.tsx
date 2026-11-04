import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRequestFont } from '../useRequestFont';
import { UIContext } from '../../context';
import type { SarakUIContextType } from '../../types';

const loadBundledFonts = vi.fn();
vi.mock('../../fontLoader', () => ({
    loadBundledFonts: (request: unknown) => loadBundledFonts(request),
}));

const INTER = "'Inter', sans-serif";
const HOST_FONTS = { custom: [{ family: 'Marca', fallback: 'sans-serif', files: [{ url: '/marca.woff2', weight: 400 }] }] };

const requestFont = (fonts: unknown, value: string) => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <UIContext.Provider value={{ options: { fonts } } as unknown as SarakUIContextType}>{children}</UIContext.Provider>
    );
    const { result } = renderHook(() => useRequestFont(), { wrapper });
    result.current(value);
};

describe('useRequestFont', () => {
    beforeEach(() => loadBundledFonts.mockClear());

    it('origem bundled (padrão): carrega a família pelo manifesto da lib', () => {
        requestFont(undefined, INTER);
        expect(loadBundledFonts).toHaveBeenCalledTimes(1);
        expect(loadBundledFonts.mock.calls[0][0].families).toEqual(['Inter']);
    });

    it('com baseUrl, repassa a origem configurada ao carregador', () => {
        requestFont({ source: 'bundled', baseUrl: '/assets/fonts' }, INTER);
        expect(loadBundledFonts.mock.calls[0][0].baseUrl).toBe('/assets/fonts');
    });

    it('origem google: o @import já cobre as da lib, nada é injetado', () => {
        requestFont('google', INTER);
        expect(loadBundledFonts).not.toHaveBeenCalled();
    });

    it('origem none: não carrega nada', () => {
        requestFont('none', INTER);
        expect(loadBundledFonts).not.toHaveBeenCalled();
    });

    it('a fonte do sistema e um valor desconhecido não pedem carga', () => {
        requestFont('bundled', 'system-ui, -apple-system, sans-serif');
        requestFont('bundled', "'Inventada', serif");
        expect(loadBundledFonts).not.toHaveBeenCalled();
    });

    it('uma família do host é carregada pelo manifesto do host, também com a origem google', () => {
        requestFont({ source: 'google', ...HOST_FONTS }, "'Marca', sans-serif");
        expect(loadBundledFonts).toHaveBeenCalledTimes(1);
        const call = loadBundledFonts.mock.calls[0][0];
        expect(call.families).toEqual(['Marca']);
        expect(call.manifest).toBeDefined();
    });
});
