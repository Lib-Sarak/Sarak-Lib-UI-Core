/**
 * Placeholder substituído no build (scripts/inject-css.mjs) pelo conteúdo real e
 * compilado de `dist/sarak.css`. Em dev/teste (rodando direto de `src/`) permanece
 * como placeholder — `injectSarakStyles` reconhece o marcador e não injeta nada
 * nesse caso, já que o dev-server processa `sarak-base.css` por conta própria via
 * bundler (ex.: `@tailwindcss/vite` no ambiente da própria biblioteca).
 */
export const SARAK_CSS = '__SARAK_CSS_PLACEHOLDER__';
