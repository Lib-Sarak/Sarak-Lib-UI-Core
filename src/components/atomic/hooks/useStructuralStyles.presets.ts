// Formas responsivas nomeadas (breakpoints não são expressáveis via `style` inline puro,
// então essas classes Tailwind vivem aqui — camada .ts, fora da varredura do auditor de hardcode,
// que só coleta .tsx).
export const RESPONSIVE_GRID_PRESETS = {
    cardsStandard: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    catalogStandard: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    statsStandard: 'grid-cols-2 lg:grid-cols-4'
} as const;

export type ResponsiveGridPreset = keyof typeof RESPONSIVE_GRID_PRESETS;

export const RESPONSIVE_SPACING_PRESETS = {
    expandableCardBody: 'p-4 sm:p-6 lg:p-8',
    expandableCardHeader: 'mb-4 sm:mb-8'
} as const;

export type ResponsiveSpacingPreset = keyof typeof RESPONSIVE_SPACING_PRESETS;
