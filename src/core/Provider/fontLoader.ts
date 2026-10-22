import { BUNDLED_FONTS, BUNDLED_FONT_UNICODE_RANGES } from './generated/font-manifest';
import { applyStyleNonce } from './utils/applyStyleNonce';

/**
 * Carregador das fontes embarcadas: injeta o `@font-face` de cada família pedida, uma vez por família (um `<style>`
 * com `data-sarak-font` no `<head>`), só com as faces que o manifesto declara — nunca um peso sem arquivo. A URL
 * vem do `new URL('./fonts/…', import.meta.url)` do módulo publicado ou, com `baseUrl`, de `baseUrl + arquivo`.
 *
 * Falha nunca é silenciosa: depois de injetar, `document.fonts.load` confirma a carga; se a URL não resolve
 * (esbuild puro, CJS no navegador), um aviso nomeia a família e a origem tentada, uma vez por família.
 *
 * Serve também às famílias do host (`options.fonts.custom`): face com estilo próprio e sem `unicode-range`.
 */
export const FONT_FACE_ATTRIBUTE = 'data-sarak-font';
const PROBE_WEIGHT = '400';
const BUNDLED_HINT = 'Sirva a pasta "fonts/" do pacote e aponte `options.fonts.baseUrl` para ela — ou use `options.fonts: \'google\'` ou `\'none\'`.';

export interface LoadableFontFace {
    file: string;
    /** Peso (`400`, `normal`…) ou faixa `"min max"` (variável). */
    weight: string;
    /** Subconjunto embarcado (dá o `unicode-range`); a face do host não tem. */
    subset?: string;
    style?: 'normal' | 'italic';
    url: () => URL;
}

export interface LoadableFontFamily {
    variable: boolean;
    faces: LoadableFontFace[];
}

export interface FontLoadRequest {
    families: string[];
    baseUrl?: string;
    manifest?: Record<string, LoadableFontFamily>;
    /** O que o aviso de falha sugere; o padrão fala da pasta `fonts/` do pacote. */
    hint?: string;
    styleNonce?: string;
}

/** String CSS entre aspas, com `\`, `"` e quebras de linha neutralizados. */
export const cssString = (value: string): string => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\n\r\f]/g, ' ')}"`;

function faceUrls(entry: LoadableFontFamily, baseUrl?: string): string[] {
    if (baseUrl) return entry.faces.map((face) => `${baseUrl.replace(/\/+$/, '')}/${face.file}`);
    return entry.faces.map((face) => face.url().href);
}

export function buildFontFaceCss(family: string, entry: LoadableFontFamily, urls: string[]): string {
    return entry.faces.map((face, index) => {
        const range = face.subset ? BUNDLED_FONT_UNICODE_RANGES[face.subset] : undefined;
        return [
            '@font-face {',
            `  font-family: ${cssString(family)};`,
            `  font-style: ${face.style ?? 'normal'};`,
            '  font-display: swap;',
            `  font-weight: ${face.weight};`,
            `  src: url(${cssString(urls[index])})${face.file.endsWith('.woff2') ? ' format("woff2")' : ''};`,
            ...(range ? [`  unicode-range: ${range};`] : []),
            '}',
        ].join('\n');
    }).join('\n');
}

function warnFontFailure(family: string, origin: string, hint = BUNDLED_HINT): void {
    console.warn(`[Sarak:UI] A fonte "${family}" não carregou (origem tentada: ${origin}). ${hint}`);
}

const probeWeight = (entry: LoadableFontFamily): string =>
    entry.variable || entry.faces.some((face) => face.weight === PROBE_WEIGHT) ? PROBE_WEIGHT : entry.faces[0].weight;

async function confirmLoaded(family: string, entry: LoadableFontFamily, origin: string, hint?: string): Promise<void> {
    const fontSet = typeof document.fonts?.load === 'function' ? document.fonts : null;
    if (!fontSet) return;
    const faces = await fontSet.load(`${probeWeight(entry)} 1em ${cssString(family)}`).catch(() => null);
    if (!faces || faces.length === 0 || faces.some((face) => face.status === 'error')) warnFontFailure(family, origin, hint);
}

const isInjected = (family: string): boolean =>
    Array.from(document.head.querySelectorAll(`style[${FONT_FACE_ATTRIBUTE}]`)).some((el) => el.getAttribute(FONT_FACE_ATTRIBUTE) === family);

function injectFamily(family: string, entry: LoadableFontFamily, { baseUrl, hint, styleNonce }: FontLoadRequest): void {
    const style = document.createElement('style');
    style.setAttribute(FONT_FACE_ATTRIBUTE, family);
    applyStyleNonce(style, styleNonce);
    document.head.appendChild(style);
    let urls: string[];
    try {
        urls = faceUrls(entry, baseUrl);
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        warnFontFailure(family, `new URL('./fonts/${entry.faces[0].file}', import.meta.url) — ${reason}`, hint);
        return;
    }
    style.textContent = buildFontFaceCss(family, entry, urls);
    void confirmLoaded(family, entry, urls[0], hint);
}

/** Injeta o `@font-face` das famílias pedidas que o manifesto conhece e que ainda não estão no documento. */
export function loadBundledFonts(request: FontLoadRequest): void {
    if (typeof document === 'undefined') return;
    const manifest = request.manifest ?? BUNDLED_FONTS;
    for (const family of request.families) {
        const entry = manifest[family];
        if (entry && !isInjected(family)) injectFamily(family, entry, request);
    }
}
