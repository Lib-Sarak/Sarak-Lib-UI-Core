/**
 * Injeção de CSS em runtime (Spec 08 §2 — Instalação Zero-Config).
 *
 * Cria um único `<style>` no `<head>` com o stylesheet compilado da Sarak, evitando
 * que o consumidor precise importar `dist/sarak.css` manualmente. Idempotente (guard
 * por `id`): seguro contra HMR, múltiplos imports ou múltiplas instâncias do Provider.
 * SSR-safe: no-op quando `document` não existe.
 */

const STYLE_TAG_ID = 'sarak-ui-core-styles';

// Nota de build: NÃO compare `css` contra o literal do placeholder aqui — uma
// comparação entre dois literais idênticos é constant-foldable pelo minificador do
// esbuild (ele prova a condição em tempo de build e elimina o resto da função como
// código morto ANTES do postbuild ter chance de substituir o placeholder). Por isso
// o único guard é "não-vazio": em dev/teste (placeholder ainda presente) isso injeta
// um `<style>` inerte com texto literal — inofensivo, o browser/jsdom só ignora um
// conteúdo que não é CSS válido.
export const injectSarakStyles = (css: string): void => {
    if (typeof document === 'undefined' || !css) return;
    if (document.getElementById(STYLE_TAG_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.textContent = css;
    document.head.appendChild(style);
};
