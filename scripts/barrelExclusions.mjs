/**
 * ALLOWLIST do gate de paridade de barril público (Spec 40.1 — L1).
 *
 * Componentes registrados em `NATIVE_COMPONENTS` que, deliberadamente, NÃO fazem parte
 * do barril público React (`src/index.ts`) — cada um com o MOTIVO escrito. Silêncio é
 * proibido: uma exclusão sem motivo, ou obsoleta (nome já exportado / não mais
 * registrado), derruba o próprio gate.
 *
 * Regras de manutenção:
 *  - Exportar o componente no `src/index.ts` → REMOVA a entrada daqui.
 *  - Registrar algo que NÃO deve ser exportado ao consumidor → adicione AQUI, com motivo.
 */

/** Componentes registrados que NÃO são exportados como valor no barril público. */
export const BARREL_VALUE_EXCLUSIONS = Object.freeze({
    // Nada por ora — a meta da Spec 40.1 é exposição TOTAL. Entradas entram aqui só
    // quando houver motivo concreto (ex.: primitiva interna do motor de manifesto).
});

/**
 * Componentes cujo tipo `<Nome>Props` existe no código mas NÃO é reexportado
 * publicamente de propósito (ex.: Props com domínio leaky a ser generalizado numa spec
 * futura). O componente-valor segue exportado; só o tipo nomeado fica de fora.
 */
export const BARREL_PROPS_EXCLUSIONS = Object.freeze({
    // `SarakCardGridProps` carrega mapping de domínio LLM (price_in/price_out/context) a
    // ser generalizado na Spec 42; congelar o tipo público agora tornaria o fix da 42 um
    // breaking change. O componente `SarakCardGrid` segue exportado; só o tipo espera a 42.
    SarakCardGrid: 'Props com domínio leaky (mapping LLM) — generalização é a Spec 42; não congelar o tipo antes.',
});
