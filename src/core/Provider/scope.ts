/**
 * Modo de consumo e escopo da ilha (Spec 24 — Modo Embarcado).
 *
 * A lib atende dois modos:
 * - `app` (default): o sistema NASCE com a lib — o Provider é dono da página
 *   (preflight global, `document.title`, vars no `:root`, overlays fixos).
 * - `embedded`: a lib renderiza uma ILHA sobre um frontend que já existe — o
 *   Provider vira um cidadão da página e não toca em nada fora do container.
 *
 * Este módulo é o ponto único de verdade do modo e da classe de escopo, para que
 * runtime (Provider/DesignInjector/portais) e build (`scripts/build-scoped-css.mjs`)
 * não divirjam.
 */

import { createContext, useContext } from 'react';
import type { SarakUIMode, SarakUIOptions } from './types';

/** Classe raiz da ilha. DEVE casar com `SCOPE_CLASS` de `scripts/build-scoped-css.mjs`. */
export const SARAK_SCOPE_CLASS = 'sarak-scope';

/**
 * Dica de modo lida do documento ANTES de qualquer render.
 *
 * A injeção automática de CSS (Spec 08 §2) roda na IMPORTAÇÃO do módulo, muito antes
 * de o Provider montar e saber o modo. Num host já renderizado (SSR/HTML estático),
 * isso significaria um flash do preflight global re-estilizando a página. O consumidor
 * embarcado mata esse flash marcando o documento:
 *
 * ```html
 * <html data-sarak-ui-mode="embedded">
 * ```
 */
export const SARAK_MODE_ATTRIBUTE = 'data-sarak-ui-mode';

export const readDocumentModeHint = (): SarakUIMode | null => {
    if (typeof document === 'undefined') return null;
    const hint = document.documentElement?.getAttribute(SARAK_MODE_ATTRIBUTE);
    return hint === 'embedded' || hint === 'app' ? hint : null;
};

/** Resolve o modo efetivo. `options.mode` manda; sem ele, o default é `app`. */
export const resolveSarakUIMode = (options: SarakUIOptions | undefined): SarakUIMode =>
    options?.mode ?? 'app';

/**
 * Classe de escopo ativa. Vazia no Modo App (o CSS é global e não precisa de âncora);
 * `sarak-scope` no Modo Embarcado.
 *
 * Consumida principalmente pelos PORTAIS: eles saem da árvore DOM da ilha e vão para o
 * `document.body`, então o seletor de escopo precisa viajar junto — sem isso, um toast
 * disparado pelo manifesto renderiza sem nenhum estilo da lib.
 */
export const SarakScopeContext = createContext<string>('');

export const useSarakScopeClass = (): string => useContext(SarakScopeContext);
