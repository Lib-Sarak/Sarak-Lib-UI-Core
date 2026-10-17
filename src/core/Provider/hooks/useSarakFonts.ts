import { useEffect, useMemo } from 'react';
import type { SarakThemePayload, SarakUIMode, SarakUIOptions } from '../types';
import { buildGoogleFontsUrl } from '../utils/googleFontsUrl';
import { resolveFontsOption, resolveUsedFontFamilies } from '../utils/fontSelection';
import { getHostFontRegistry } from '../utils/hostFonts';
import { loadBundledFonts } from '../fontLoader';

const FAMILY_SEPARATOR = '|';
const HOST_HINT = 'Confira a `url` registrada em `options.fonts.custom` (o arquivo é servido pelo host).';

/** `options.fonts: 'google'` — o caminho anterior, intocado: `preconnect` + `@import` de toda família de `THEME_FONTS`. */
const useGoogleFonts = (enabled: boolean) => {
    useEffect(() => {
        if (typeof document === 'undefined' || !enabled) return;
        const domains = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
        domains.forEach(domain => {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = domain;
            document.head.appendChild(preconnect);
        });

        const ID = 'sarak-core-fonts';
        if (document.getElementById(ID)) return;
        const style = document.createElement('style');
        style.id = ID;
        style.textContent = `@import url('${buildGoogleFontsUrl()}');`;
        document.head.prepend(style);
    }, [enabled]);
};

/**
 * Fontes do tema, pela origem de `options.fonts`: `'bundled'` (padrão) carrega só as famílias que o design no ar usa,
 * sem requisição a terceiros; `'google'` mantém o `@import` do Google Fonts; `'none'` não injeta nada.
 * As famílias do host (`options.fonts.custom`) em uso ganham o `@font-face` delas com `'bundled'` e `'google'`;
 * com `'none'` o host carrega tudo sozinho.
 *
 * No Modo Embarcado (Spec 24) nada roda sem `options.embedded.injectGlobalFonts`: `@font-face` é necessariamente
 * global (não existe fonte confinada a um seletor), e a ilha herda as fontes da página.
 */
export const useSarakFonts = (design: SarakThemePayload, mode: SarakUIMode, options?: SarakUIOptions) => {
    const { source, baseUrl } = resolveFontsOption(options?.fonts);
    const enabled = mode !== 'embedded' || options?.embedded?.injectGlobalFonts === true;
    useGoogleFonts(enabled && source === 'google');

    const hostFonts = getHostFontRegistry(options?.fonts);
    const familiesKey = useMemo(() => resolveUsedFontFamilies(design, hostFonts).join(FAMILY_SEPARATOR), [design, hostFonts]);
    useEffect(() => {
        if (!enabled || source === 'none' || !familiesKey) return;
        const families = familiesKey.split(FAMILY_SEPARATOR);
        if (source === 'bundled') loadBundledFonts({ families, baseUrl });
        if (hostFonts) loadBundledFonts({ families, manifest: hostFonts.manifest, hint: HOST_HINT });
    }, [enabled, source, baseUrl, familiesKey, hostFonts]);
};
