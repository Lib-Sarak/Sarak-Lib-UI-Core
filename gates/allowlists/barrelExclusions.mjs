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
    // Entradas entram aqui só quando houver motivo concreto (ex.: peça interna de outro
    // componente, ou tipo do lado duplicado/não-canônico de um nome colidente).
    SarakAppChromeMobile: 'Colapso interno do SarakAppChrome no celular (Spec 40.3) — não é peça standalone do barril.',
});

/**
 * Componentes cujo tipo `<Nome>Props` existe no código mas NÃO é reexportado
 * publicamente de propósito (ex.: Props com domínio leaky a ser generalizado numa spec
 * futura). O componente-valor segue exportado; só o tipo nomeado fica de fora.
 */
export const BARREL_PROPS_EXCLUSIONS = Object.freeze({
    // `SarakCardGridProps` saiu daqui na Spec 42: o mapping foi generalizado (fim de
    // `price_in`/`price_out`/`context`) e o tipo passou a ser exportado publicamente.
    SarakAppChromeMobile: 'Mesmo motivo do valor (ver BARREL_VALUE_EXCLUSIONS) — colapso interno, não peça standalone.',
});
