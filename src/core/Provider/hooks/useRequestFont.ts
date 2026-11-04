import { useCallback, useContext } from 'react';
import { UIContext } from '../context';
import { loadBundledFonts } from '../fontLoader';
import { resolveFontFamily, resolveFontsOption } from '../utils/fontSelection';
import { getHostFontRegistry } from '../utils/hostFonts';

const HOST_HINT = 'Confira a `url` registrada em `options.fonts.custom` (o arquivo é servido pelo host).';

/**
 * Pede a carga de UMA fonte pela origem de `options.fonts`, para quem mostra uma família que o design no ar não usa
 * (a amostra de fonte do painel). `'bundled'` injeta o `@font-face` da família — e o da família do host, se for dela;
 * `'google'` já carregou as da lib pelo `@import` (só a do host é injetada); `'none'` não carrega nada. Pedir de novo uma família já carregada não faz nada.
 */
export const useRequestFont = (): ((fontValue: string) => void) => {
    const options = useContext(UIContext)?.options;
    return useCallback((fontValue: string) => {
        const { source, baseUrl } = resolveFontsOption(options?.fonts);
        if (source === 'none') return;
        const hostFonts = getHostFontRegistry(options?.fonts);
        const family = resolveFontFamily(fontValue, hostFonts);
        if (!family) return;
        const request = { families: [family], styleNonce: options?.styleNonce };
        if (source === 'bundled') loadBundledFonts({ ...request, baseUrl });
        if (hostFonts) loadBundledFonts({ ...request, manifest: hostFonts.manifest, hint: HOST_HINT });
    }, [options]);
};
