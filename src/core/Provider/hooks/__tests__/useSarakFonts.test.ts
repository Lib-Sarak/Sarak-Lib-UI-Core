/**
 * `useSarakFonts` — a escolha da origem (`options.fonts`) e o que o hook entrega ao carregador.
 *
 * O carregador (`fontLoader.test.ts`) prova o `@font-face` gerado, os pesos e o aviso; aqui o carregador é simulado
 * e o que se prova é a decisão do hook: qual origem roda, com quais famílias, quando roda de novo e quando não roda.
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SarakCustomFont, SarakThemePayload, SarakUIOptions } from '../../types';

const { loadBundledFonts } = vi.hoisted(() => ({ loadBundledFonts: vi.fn() }));
vi.mock('../../fontLoader', () => ({ loadBundledFonts }));

import { useSarakFonts } from '../useSarakFonts';

const THEME_A: SarakThemePayload = { headingFont: "'Orbitron', sans-serif", bodyFont: "'Lora', serif", monoFont: "'JetBrains Mono', monospace" };
const THEME_B: SarakThemePayload = { ...THEME_A, headingFont: "'Oswald', sans-serif" };

const renderFonts = (design: SarakThemePayload, options?: SarakUIOptions, mode: 'app' | 'embedded' = 'app') =>
    renderHook(({ current }) => useSarakFonts(current, mode, options), { initialProps: { current: design } });
const googleStyle = () => document.getElementById('sarak-core-fonts');
const preconnects = () => document.querySelectorAll('link[rel="preconnect"]');
const requested = (call = 0): string[] => [...loadBundledFonts.mock.calls[call][0].families].sort();

beforeEach(() => loadBundledFonts.mockClear());
afterEach(() => document.head.querySelectorAll('#sarak-core-fonts, link[rel="preconnect"]').forEach((el) => el.remove()));

describe('useSarakFonts — as três origens', () => {
    it("padrão (`'bundled'`): entrega ao carregador as famílias do design, sem `baseUrl`, sem Google", () => {
        renderFonts(THEME_A);
        expect(loadBundledFonts).toHaveBeenCalledTimes(1);
        expect(requested()).toEqual(['JetBrains Mono', 'Lora', 'Orbitron']);
        expect(loadBundledFonts.mock.calls[0][0].baseUrl).toBeUndefined();
        expect(googleStyle()).toBeNull();
        expect(preconnects()).toHaveLength(0);
    });

    it('`{ baseUrl }` repassa a pasta do host ao carregador', () => {
        renderFonts(THEME_A, { fonts: { baseUrl: '/static/fontes/' } });
        expect(loadBundledFonts.mock.calls[0][0].baseUrl).toBe('/static/fontes/');
    });

    it("`'google'`: `@import` + dois `preconnect`, e o carregador embarcado não roda", () => {
        renderFonts(THEME_A, { fonts: 'google' });
        expect(googleStyle()?.textContent).toContain("@import url('https://fonts.googleapis.com/css2?");
        expect(preconnects()).toHaveLength(2);
        expect(loadBundledFonts).not.toHaveBeenCalled();
    });

    it("`'none'`: nem carregador, nem `@import`, nem `preconnect`", () => {
        renderFonts(THEME_A, { fonts: { source: 'none' } });
        expect(loadBundledFonts).not.toHaveBeenCalled();
        expect(googleStyle()).toBeNull();
        expect(preconnects()).toHaveLength(0);
    });
});

describe('useSarakFonts — Modo Embarcado e troca de design', () => {
    it('Embarcado sem `injectGlobalFonts`: nenhuma origem roda, nem a do Google', () => {
        renderFonts(THEME_A, undefined, 'embedded');
        renderFonts(THEME_A, { fonts: 'google' }, 'embedded');
        expect(loadBundledFonts).not.toHaveBeenCalled();
        expect(googleStyle()).toBeNull();
        expect(preconnects()).toHaveLength(0);
    });

    it('Embarcado com `injectGlobalFonts`: a origem escolhida roda', () => {
        renderFonts(THEME_A, { embedded: { injectGlobalFonts: true } }, 'embedded');
        expect(requested()).toEqual(['JetBrains Mono', 'Lora', 'Orbitron']);
    });

    it('troca de família no design pede de novo; novo objeto com as mesmas famílias não', () => {
        const { rerender } = renderFonts(THEME_A);
        rerender({ current: { ...THEME_A } });
        expect(loadBundledFonts).toHaveBeenCalledTimes(1);
        rerender({ current: THEME_B });
        expect(loadBundledFonts).toHaveBeenCalledTimes(2);
        expect(requested(1)).toEqual(['JetBrains Mono', 'Lora', 'Oswald']);
    });
});

describe('useSarakFonts — famílias do host (`options.fonts.custom`)', () => {
    const custom: SarakCustomFont[] = [{ family: 'Casa Display', files: [{ url: '/fontes/casa.woff2', weight: 700 }] }];
    const HOST_THEME: SarakThemePayload = { ...THEME_A, headingFont: "'Casa Display', sans-serif" };
    const hostCall = () => loadBundledFonts.mock.calls.find(([request]) => request.manifest);

    it.each(['bundled', 'google'] as const)("com `'%s'`: o carregador recebe a família do host com o manifesto dela", (source) => {
        renderFonts(HOST_THEME, { fonts: { source, custom } });
        const [request] = hostCall() ?? [];
        expect(request?.families).toContain('Casa Display');
        expect(Object.keys(request?.manifest ?? {})).toEqual(['Casa Display']);
        expect(request?.hint).toContain('options.fonts.custom');
    });

    it("com `'none'`: nada — o host carrega tudo sozinho", () => {
        renderFonts(HOST_THEME, { fonts: { source: 'none', custom } });
        expect(loadBundledFonts).not.toHaveBeenCalled();
    });

    it('sem a família no design, nenhuma família do host é pedida', () => {
        renderFonts(THEME_A, { fonts: { custom } });
        const [request] = hostCall() ?? [];
        expect(request?.families).not.toContain('Casa Display');
    });
});
