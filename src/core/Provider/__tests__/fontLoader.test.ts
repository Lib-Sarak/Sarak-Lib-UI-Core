/**
 * Fontes embarcadas — o carregador (`fontLoader`) e a escolha da origem (`useSarakFonts`, `options.fonts`).
 *
 * O jsdom não baixa fonte nem tem `document.fonts`: aqui um `load` simulado responde por ele, e o que se prova é o
 * `@font-face` que vai para o `<head>` (quais famílias, quantas vezes, quais pesos, qual URL) e o aviso quando a
 * carga falha. A prova de que o navegador usa a fonte, sem requisição externa, é do caso de navegador.
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { FONT_FACE_ATTRIBUTE, buildFontFaceCss, cssString, loadBundledFonts, type LoadableFontFamily } from '../fontLoader';
import { BUNDLED_FONTS, type BundledFontFamily } from '../generated/font-manifest';
import { useSarakFonts } from '../hooks/useSarakFonts';
import { resolveFontsOption, resolveUsedFontFamilies } from '../utils/fontSelection';
import type { SarakThemePayload, SarakUIOptions } from '../types';

const ORBITRON = "'Orbitron', sans-serif";
const LORA = "'Lora', serif";
const OSWALD = "'Oswald', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const THEME_A: SarakThemePayload = { headingFont: ORBITRON, bodyFont: LORA, monoFont: MONO };
const THEME_B: SarakThemePayload = { headingFont: OSWALD, bodyFont: LORA, monoFont: MONO };

let load: Mock;

const injected = (): string[] =>
    Array.from(document.head.querySelectorAll(`style[${FONT_FACE_ATTRIBUTE}]`)).map((el) => el.getAttribute(FONT_FACE_ATTRIBUTE) ?? '');
const cssOf = (family: string): string =>
    Array.from(document.head.querySelectorAll(`style[${FONT_FACE_ATTRIBUTE}]`)).find((el) => el.getAttribute(FONT_FACE_ATTRIBUTE) === family)?.textContent ?? '';
const declaredWeights = (css: string): string[] => [...css.matchAll(/font-weight: ([^;]+);/g)].map((match) => match[1]);
const loadedFamilies = (): string[] => load.mock.calls.map(([spec]) => String(spec).replace(/^\S+ 1em "(.+)"$/, '$1'));
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const renderFonts = (design: SarakThemePayload, options?: SarakUIOptions, mode: 'app' | 'embedded' = 'app') =>
    renderHook(({ current }) => useSarakFonts(current, mode, options), { initialProps: { current: design } });

beforeEach(() => {
    load = vi.fn(() => Promise.resolve([{ status: 'loaded' }]));
    Object.defineProperty(document, 'fonts', { configurable: true, value: { load } });
});

afterEach(() => {
    document.head.querySelectorAll(`style[${FONT_FACE_ATTRIBUTE}], #sarak-core-fonts, link[rel="preconnect"]`).forEach((el) => el.remove());
    Reflect.deleteProperty(document, 'fonts');
    vi.restoreAllMocks();
});

describe('famílias usadas — só as do design no ar', () => {
    it('lê título, corpo, mono e identidade; padrão do token quando o design não declara', () => {
        expect(resolveUsedFontFamilies(THEME_A).sort()).toEqual(['JetBrains Mono', 'Lora', 'Orbitron']);
        expect(resolveUsedFontFamilies({ ...THEME_A, identityFontFamily: OSWALD })).toContain('Oswald');
        expect(resolveUsedFontFamilies({})).toEqual(expect.arrayContaining(['Outfit', 'JetBrains Mono']));
    });

    it('valor fora da lista e a fonte do sistema não pedem arquivo', () => {
        const families = resolveUsedFontFamilies({ headingFont: "'Comic Sans', cursive", bodyFont: 'system-ui, -apple-system, sans-serif', monoFont: MONO });
        expect(families).toEqual(['JetBrains Mono']);
    });
});

describe("`'bundled'` (padrão) — o `@font-face` gerado", () => {
    it('(a) só as famílias usadas, uma vez cada, mesmo com novo render', () => {
        const { rerender } = renderFonts(THEME_A);
        rerender({ current: { ...THEME_A } });
        expect(injected().sort()).toEqual(['JetBrains Mono', 'Lora', 'Orbitron']);
        expect(loadedFamilies().sort()).toEqual(['JetBrains Mono', 'Lora', 'Orbitron']);
    });

    it('(b) troca de tema carrega a família nova e não volta à antiga', () => {
        const { rerender } = renderFonts(THEME_A);
        load.mockClear();
        rerender({ current: THEME_B });
        expect(loadedFamilies()).toEqual(['Oswald']);
        expect(injected().filter((family) => family === 'Orbitron')).toHaveLength(1);
    });

    it('`font-display: swap`, `unicode-range` latin e URL do módulo publicado', () => {
        loadBundledFonts({ families: ['Orbitron'] });
        const css = cssOf('Orbitron');
        expect(css).toContain('font-family: "Orbitron";');
        expect(css).toContain('font-display: swap;');
        expect(css).toMatch(/unicode-range: U\+0000-00FF,/);
        expect(css).toMatch(/src: url\("[^"]*\/fonts\/orbitron-latin-wght-normal\.woff2"\) format\("woff2"\);/);
    });

    it('`baseUrl` aponta os arquivos para a pasta que o host serve', () => {
        renderFonts(THEME_A, { fonts: { baseUrl: 'https://cdn.exemplo.test/sarak/fonts/' } });
        expect(cssOf('Lora')).toContain('src: url("https://cdn.exemplo.test/sarak/fonts/lora-latin-wght-normal.woff2")');
    });

    it('(e) declara só os pesos com arquivo — nunca um peso sem arquivo', () => {
        loadBundledFonts({ families: Object.keys(BUNDLED_FONTS) });
        expect(declaredWeights(cssOf('Lato'))).toEqual(['300', '400', '700', '900']);
        expect(declaredWeights(cssOf('VT323'))).toEqual(['400']);
        for (const [family, entry] of Object.entries(BUNDLED_FONTS)) {
            expect(declaredWeights(cssOf(family))).toEqual(entry.faces.map((face) => face.weight));
        }
    });

    it('não faz `preconnect` nem cita o Google Fonts', () => {
        renderFonts(THEME_A);
        expect(document.querySelectorAll('link[rel="preconnect"]')).toHaveLength(0);
        expect(document.getElementById('sarak-core-fonts')).toBeNull();
        expect(document.head.innerHTML).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
    });
});

describe('(f) falha nunca é silenciosa', () => {
    it('aplica o nonce à folha de fonte criada pelo carregador', () => {
        loadBundledFonts({ families: ['Orbitron'], styleNonce: 'font-face-nonce' });

        expect(document.querySelector(`style[${FONT_FACE_ATTRIBUTE}="Orbitron"]`)).toHaveAttribute('nonce', 'font-face-nonce');
    });

    it('carga recusada: avisa nomeando a família, a origem tentada e `baseUrl` — uma vez', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        load.mockImplementation(() => Promise.reject(new Error('NetworkError')));
        loadBundledFonts({ families: ['Orbitron'], baseUrl: '/fontes' });
        loadBundledFonts({ families: ['Orbitron'], baseUrl: '/fontes' });
        await flush();
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('"Orbitron"');
        expect(warn.mock.calls[0][0]).toContain('/fontes/orbitron-latin-wght-normal.woff2');
        expect(warn.mock.calls[0][0]).toContain('options.fonts.baseUrl');
    });

    it('face que falha na carga também avisa', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        load.mockImplementation(() => Promise.resolve([{ status: 'error' }]));
        loadBundledFonts({ families: ['Lora'] });
        await flush();
        expect(warn.mock.calls[0][0]).toContain('"Lora"');
    });

    it('URL que não resolve (sem `import.meta.url`): avisa nomeando a família, sem injetar regra', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const broken: Record<string, BundledFontFamily> = {
            Lora: { variable: true, faces: [{ ...BUNDLED_FONTS.Lora.faces[0], url: () => { throw new TypeError('Invalid URL'); } }] },
        };
        loadBundledFonts({ families: ['Lora'], manifest: broken });
        loadBundledFonts({ families: ['Lora'], manifest: broken });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toMatch(/"Lora".*import\.meta\.url.*Invalid URL.*options\.fonts\.baseUrl/);
        expect(cssOf('Lora')).toBe('');
        expect(load).not.toHaveBeenCalled();
    });
});

describe('as outras origens e o Modo Embarcado', () => {
    it("(c) `'none'` não injeta nada, nem `preconnect`", () => {
        renderFonts(THEME_A, { fonts: 'none' });
        expect(injected()).toEqual([]);
        expect(document.getElementById('sarak-core-fonts')).toBeNull();
        expect(document.querySelectorAll('link[rel="preconnect"]')).toHaveLength(0);
    });

    it("(d) `'google'` mantém o `@import` e o `preconnect` de antes, sem `@font-face` embarcado", () => {
        renderFonts(THEME_A, { fonts: { source: 'google' }, styleNonce: 'google-fonts-nonce' });
        expect(document.getElementById('sarak-core-fonts')?.textContent).toMatch(/^@import url\('https:\/\/fonts\.googleapis\.com\/css2\?/);
        expect(document.getElementById('sarak-core-fonts')).toHaveAttribute('nonce', 'google-fonts-nonce');
        const preconnects = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="preconnect"]')).map((link) => link.href);
        expect(preconnects).toEqual(['https://fonts.googleapis.com/', 'https://fonts.gstatic.com/']);
        expect(injected()).toEqual([]);
    });

    it('Modo Embarcado: nada sem `injectGlobalFonts`; com ele, a origem escolhida', () => {
        renderFonts(THEME_A, undefined, 'embedded');
        expect(injected()).toEqual([]);
        renderFonts(THEME_A, { embedded: { injectGlobalFonts: true } }, 'embedded');
        expect(injected().sort()).toEqual(['JetBrains Mono', 'Lora', 'Orbitron']);
    });

    it('origem: padrão `bundled`; valor desconhecido cai no padrão; `baseUrl` vazio é ignorado', () => {
        expect(resolveFontsOption()).toEqual({ source: 'bundled' });
        expect(resolveFontsOption('google')).toEqual({ source: 'google' });
        expect(resolveFontsOption('cdn' as never)).toEqual({ source: 'bundled' });
        expect(resolveFontsOption({ baseUrl: '' })).toEqual({ source: 'bundled', baseUrl: undefined });
    });
});

describe('famílias do host e a `cssString`', () => {
    const hostFamily: LoadableFontFamily = {
        variable: false,
        faces: [
            { file: '/fontes/casa.woff2', weight: '400', url: () => new URL('/fontes/casa.woff2', 'https://host.test/') },
            { file: '/fontes/casa-italic.woff', weight: 'bold', style: 'italic', url: () => new URL('/fontes/casa-italic.woff', 'https://host.test/') },
        ],
    };

    it('face do host: estilo próprio, sem `unicode-range`, `format()` só para woff2, dica própria no aviso', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        load.mockImplementation(() => Promise.reject(new Error('NetworkError')));
        loadBundledFonts({ families: ['Casa Host'], manifest: { 'Casa Host': hostFamily }, hint: 'Confira a url registrada.' });
        const css = cssOf('Casa Host');
        expect(css).toContain('src: url("https://host.test/fontes/casa.woff2") format("woff2");');
        expect(css).toContain('src: url("https://host.test/fontes/casa-italic.woff");');
        expect(css).toContain('font-style: italic;');
        expect(css).not.toContain('unicode-range');
        await flush();
        expect(warn.mock.calls[0][0]).toMatch(/"Casa Host".*Confira a url registrada\./);
    });

    it('a `cssString` neutraliza aspas, barra invertida e quebra de linha', () => {
        expect(cssString('a"b\\c\nd')).toBe('"a\\"b\\\\c d"');
        const css = buildFontFaceCss('X"; } body { color: red', hostFamily, ['/a"); } body { color: red', '/b']);
        expect(css).toContain('font-family: "X\\"; } body { color: red";');
        expect(css).toContain('src: url("/a\\"); } body { color: red") format("woff2");');
    });
});
