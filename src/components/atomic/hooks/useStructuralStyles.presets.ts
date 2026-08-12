// Formas responsivas nomeadas (breakpoints não são expressáveis via `style` inline puro,
// então essas classes Tailwind vivem aqui — camada .ts, fora da varredura do auditor de hardcode,
// que só coleta .tsx).
// Usa `@min-[768px]:` (Container Query com valor arbitrário) em vez de `@md:`/`@lg:` porque a
// escala nomeada de container query do Tailwind v4 (--container-md=28rem) é DIFERENTE da escala
// de tela (--breakpoint-md=48rem) — os nomes batem, os valores não.
//
// As classes abaixo são escritas LITERAL de propósito (plan-39): o scanner do Tailwind v4 lê
// o arquivo como TEXTO — uma classe montada por interpolação de template literal nunca vira
// classe válida, e a regra correspondente nunca é gerada. `BP_SM`/`BP_XL` continuam exportados
// só para o teste companheiro comparar a forma literal contra a interpolada e pegar deriva de
// constante.
export const BP_SM = 640;
export const BP_XL = 1280;

export const RESPONSIVE_GRID_PRESETS = {
    cardsStandard: 'grid-cols-1 @min-[768px]:grid-cols-2 @min-[1280px]:grid-cols-3',
    catalogStandard: 'grid-cols-1 @min-[768px]:grid-cols-2 @min-[1024px]:grid-cols-3 @min-[1280px]:grid-cols-4',
    statsStandard: 'grid-cols-2 @min-[1024px]:grid-cols-4'
} as const;

export type ResponsiveGridPreset = keyof typeof RESPONSIVE_GRID_PRESETS;

export const RESPONSIVE_SPACING_PRESETS = {
    expandableCardBody: 'p-4 @min-[640px]:p-6 @min-[1024px]:p-8',
    expandableCardHeader: 'mb-4 @min-[640px]:mb-8'
} as const;

export type ResponsiveSpacingPreset = keyof typeof RESPONSIVE_SPACING_PRESETS;
