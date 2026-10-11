import { useEffect } from 'react';
import { BrandingState } from './useBrandingManager';
import type { SarakUIMode } from '../types';
import { buildGoogleFontsUrl } from '../utils/googleFontsUrl';

/**
 * Efeitos GLOBAIS do documento: fontes, título e ícone da aba.
 *
 * No Modo Embarcado (Spec 24) nada disso roda por default — título e favicon são do
 * host, e a ilha herda as fontes da página. As fontes voltam com opt-in explícito
 * (`options.embedded.injectGlobalFonts`), porque `@import` de webfont é
 * necessariamente global (não existe `@font-face` confinado a um seletor).
 *
 * **FONTE ÚNICA do `document.title` (Spec 47).** Até aqui dois efeitos independentes
 * escreviam o título (este, via `branding.tabName`, e o `DesignInjector`, via
 * `systemName`) e podiam brigar. Agora este hook é o único caminho, com precedência
 * explícita, e a escrita é **opt-in**: sem valor do consumidor, a lib não toca no
 * `<title>` que o host definiu no `index.html`.
 */
export const useSarakUIEffects = (
    branding: BrandingState | undefined,
    mode: SarakUIMode = 'app',
    injectGlobalFonts: boolean = false,
    systemName?: string,
) => {
    const isEmbedded = mode === 'embedded';
    const shouldInjectFonts = !isEmbedded || injectGlobalFonts;

    // Precedência: `branding.tabName` (porta explícita "nome da aba") vence
    // `systemName` (nome do sistema, vindo do design) — do mais específico para o
    // mais genérico. Nenhum dos dois → `undefined` → a lib não escreve o título.
    const resolvedTitle = branding?.tabName || systemName;

    // Injeção de Fontes Avançadas (Core Optimization)
    useEffect(() => {
        if (typeof document === 'undefined' || !shouldInjectFonts) return;
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
    }, [shouldInjectFonts]);

    // Identidade da aba (título + ícone) — só toca no que o consumidor FORNECEU.
    useEffect(() => {
        if (typeof document === 'undefined' || isEmbedded) return;

        if (resolvedTitle) {
            document.title = resolvedTitle;
        }

        if (branding?.logoBase64) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = branding.logoBase64;
        }
    }, [resolvedTitle, branding?.logoBase64, isEmbedded]);
};
