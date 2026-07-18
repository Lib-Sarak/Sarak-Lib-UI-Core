import React, { useEffect } from 'react';
import { removeSarakGlobalStyles } from '../injectStyles';
import { SARAK_MODE_ATTRIBUTE, SARAK_SCOPE_CLASS } from '../scope';
import type { SarakUIMode } from '../types';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

const CSS_LOADED_VAR = '--sarak-ui-core-css-loaded';

/**
 * Guarda do stylesheet (Spec 08 §2 + Spec 24).
 *
 * **Modo App:** confere que a injeção automática de CSS aconteceu; se o bundler tiver
 * feito tree-shaking do side-effect, avisa em dev com a correção exata.
 *
 * **Modo Embarcado:** faz o oposto — garante que o CSS GLOBAL não fique no `<head>`.
 * A injeção automática roda na importação do módulo, antes de o Provider saber o modo,
 * então aqui ela é DESFEITA (em layout effect, antes do primeiro paint da ilha) e o
 * consumidor é orientado a importar a variante escopada.
 */
export const useSarakStylesheetGuard = (mode: SarakUIMode, scopeElement: HTMLElement | null): void => {
    // Remoção do CSS global: layout effect para acontecer antes do paint da ilha.
    useIsomorphicLayoutEffect(() => {
        if (mode !== 'embedded') return;
        const removed = removeSarakGlobalStyles();
        if (removed && process.env.NODE_ENV !== 'production') {
            console.warn(
                '[Sarak] mode: "embedded" — o stylesheet GLOBAL da lib foi removido do <head> ' +
                'para não re-estilizar a página do host. Para evitar qualquer flash, marque o ' +
                `documento com <html ${SARAK_MODE_ATTRIBUTE}="embedded"> (a injeção automática ` +
                'nem chega a rodar).',
            );
        }
    }, [mode]);

    // Diagnóstico dev-only: o CSS certo chegou?
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;

        if (mode === 'embedded') {
            if (!scopeElement) return;
            const loaded = getComputedStyle(scopeElement).getPropertyValue(CSS_LOADED_VAR).trim();
            if (!loaded) {
                console.error(
                    '[Sarak] CSS escopado não detectado no Modo Embarcado. Importe ' +
                    '"@sarak/lib-ui-core/dist/sarak-scoped.css" no entry point da aplicação — ' +
                    `é ele que confina o preflight e os utilities em ".${SARAK_SCOPE_CLASS}". ` +
                    'A variante global (dist/sarak.css) NÃO deve ser usada aqui: ela re-estiliza ' +
                    'o front do host.',
                );
            }
            return;
        }

        const loaded = getComputedStyle(document.documentElement).getPropertyValue(CSS_LOADED_VAR).trim();
        if (!loaded) {
            console.error(
                '[Sarak] CSS não detectado. A injeção automática deveria ter carregado o ' +
                'stylesheet ao importar "@sarak/lib-ui-core" — se isso falhou (ex.: bundler ' +
                'fazendo tree-shaking do side-effect), importe manualmente ' +
                '"@sarak/lib-ui-core/dist/sarak.css" no entry point da aplicação.',
            );
        }
    }, [mode, scopeElement]);
};
