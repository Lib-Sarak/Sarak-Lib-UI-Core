import { useEffect } from 'react';
import { BrandingState } from './useBrandingManager';
import type { SarakUIMode } from '../types';

/**
 * Efeitos GLOBAIS do documento: título e ícone da aba (as fontes são do `useSarakFonts`).
 *
 * No Modo Embarcado (Spec 24) nada disso roda — título e favicon são do host.
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
    systemName?: string,
) => {
    const isEmbedded = mode === 'embedded';

    // Precedência: `branding.tabName` (porta explícita "nome da aba") vence
    // `systemName` (nome do sistema, vindo do design) — do mais específico para o
    // mais genérico. Nenhum dos dois → `undefined` → a lib não escreve o título.
    const resolvedTitle = branding?.tabName || systemName;

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
