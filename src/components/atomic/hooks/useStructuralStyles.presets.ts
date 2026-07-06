import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../../core/Design/breakpoints';

// Formas responsivas nomeadas (breakpoints não são expressáveis via `style` inline puro,
// então essas classes Tailwind vivem aqui — camada .ts, fora da varredura do auditor de hardcode,
// que só coleta .tsx).
// Usa `@min-[Npx]:` (Container Query com valor arbitrário) em vez de `@md:`/`@lg:` porque a
// escala nomeada de container query do Tailwind v4 (--container-md=28rem) é DIFERENTE da escala
// de tela (--breakpoint-md=48rem) — os nomes batem, os valores não.
const BP_SM = 640;
const BP_XL = 1280;

export const RESPONSIVE_GRID_PRESETS = {
    cardsStandard: `grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2 @min-[${BP_XL}px]:grid-cols-3`,
    catalogStandard: `grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2 @min-[${BREAKPOINT_DESKTOP}px]:grid-cols-3 @min-[${BP_XL}px]:grid-cols-4`,
    statsStandard: `grid-cols-2 @min-[${BREAKPOINT_DESKTOP}px]:grid-cols-4`
} as const;

export type ResponsiveGridPreset = keyof typeof RESPONSIVE_GRID_PRESETS;

export const RESPONSIVE_SPACING_PRESETS = {
    expandableCardBody: `p-4 @min-[${BP_SM}px]:p-6 @min-[${BREAKPOINT_DESKTOP}px]:p-8`,
    expandableCardHeader: `mb-4 @min-[${BP_SM}px]:mb-8`
} as const;

export type ResponsiveSpacingPreset = keyof typeof RESPONSIVE_SPACING_PRESETS;
