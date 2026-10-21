/**
 * Injeção de CSS em runtime (Spec 08 §2 — Instalação Zero-Config).
 *
 * Cria um único `<style>` no `<head>` com o stylesheet compilado da Sarak, evitando
 * que o consumidor precise importar `dist/sarak.css` manualmente. Idempotente (guard
 * por `id`): seguro contra HMR e múltiplas instâncias do Provider.
 * SSR-safe: no-op quando `document` não existe.
 */

import { readDocumentModeHint } from './scope';
import { applyStyleNonce } from './utils/applyStyleNonce';

const STYLE_TAG_ID = 'sarak-ui-core-styles';

// Nota de build: NÃO compare `css` contra o literal do placeholder aqui — uma
// comparação entre dois literais idênticos é constant-foldable pelo minificador do
// esbuild (ele prova a condição em tempo de build e elimina o resto da função como
// código morto ANTES do postbuild ter chance de substituir o placeholder). Por isso
// o único guard é "não-vazio": em dev/teste (placeholder ainda presente) isso injeta
// um `<style>` inerte com texto literal — inofensivo, o browser/jsdom só ignora um
// conteúdo que não é CSS válido.
export const injectSarakStyles = (css: string, nonce?: string): void => {
    if (typeof document === 'undefined' || !css) return;
    // Modo Embarcado (Spec 24): o stylesheet global re-estilizaria o front do host
    // (preflight do Tailwind + regras de elemento da lib). O consumidor embarcado
    // importa `@sarak/lib-ui-core/dist/sarak-scoped.css`, que só age dentro da ilha.
    if (readDocumentModeHint() === 'embedded') return;
    const existingStyle = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
    if (existingStyle) {
        const existingNonce = existingStyle.getAttribute('nonce');
        if (!nonce || existingNonce === nonce) {
            applyStyleNonce(existingStyle, nonce);
            return;
        }
        existingStyle.remove();
    }
    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    applyStyleNonce(style, nonce);
    style.textContent = css;
    document.head.appendChild(style);
};

/**
 * Remove o stylesheet GLOBAL do `<head>` (Spec 24 — Modo Embarcado).
 *
 * Rede de segurança para uma folha global preexistente no modo embarcado. Devolve
 * `true` se havia algo para remover — o Provider usa isso para orientar o consumidor.
 */
export const removeSarakGlobalStyles = (): boolean => {
    if (typeof document === 'undefined') return false;
    const tag = document.getElementById(STYLE_TAG_ID);
    if (!tag) return false;
    tag.remove();
    return true;
};
