/**
 * ALLOWLIST do gate de paridade de TIPOS públicos (plan-45).
 *
 * Tipos que aparecem DECLARADOS em `dist/index.d.ts` mas, deliberadamente, NÃO são
 * exportados no bloco `export { … }` final — cada um com o MOTIVO escrito. Silêncio é
 * proibido: uma exclusão sem motivo, ou obsoleta (tipo que passou a ser exportado, ou
 * que não existe mais declarado), derruba o próprio gate.
 *
 * Regras de manutenção:
 *  - Exportar o tipo em `src/index.ts` → REMOVA a entrada daqui.
 *  - Um tipo novo que NUNCA deve ser importável pelo nome (detalhe de implementação
 *    que só existe para compor outro tipo já público) → adicione AQUI, com motivo.
 *
 * Critério para entrar aqui, herdado da plan-45 §3.1 item 2: o tipo NÃO é, ele
 * mesmo, o tipo direto de nenhuma prop/parâmetro/retorno/membro de contexto público —
 * só aparece como OPERANDO dentro da expressão de outro tipo já exportado (ex.:
 * `A & B`), e o próprio código já o documenta como detalhe interno/pendente de
 * reconciliação. Se o tipo aparece como tipo DIRETO de algo público, ele se exporta —
 * não entra aqui só porque "parece interno".
 */

export const PUBLIC_TYPE_EXCLUSIONS = Object.freeze({
    ReactFlowProps:
        'SarakFlowEngine.tsx — alias local para `ComponentProps<typeof ReactFlow>`, usado só via ' +
        'acesso indexado (`ReactFlowProps[\'nodes\']` etc.) dentro de `SarakFlowEngineProps` (já ' +
        'público). Nunca é, ele mesmo, o tipo direto de nada — e `reactflow` é peer dependency, ' +
        'com os próprios tipos disponíveis a quem precisar da forma exata.',
    SarakRuntimeExtras:
        'types.ts — chaves estruturais/sanitizador de RUNTIME que compõem `SarakDesignState` ' +
        '(já público) via interseção. O próprio comentário do tipo diz "não são design tokens ' +
        'do schema… não criar token novo aqui" — detalhe de composição, não vocabulário público.',
    SarakThemePayloadExtras:
        'types.ts — campos legados/branding pendentes de reconciliação com a paridade ' +
        '1:1:1:1:1, que compõem `SarakThemePayload` (já público) via interseção. O próprio ' +
        'comentário do tipo diz "pendente reconciliação… não adicione tokens novos aqui".',
});
