// Classes de container query em .ts, escritas LITERAIS: o scanner do Tailwind v4 lê o arquivo como texto, e
// `@min-[…]` com valor arbitrário não aceita `var()`. O valor segue `BP_SM` de `useStructuralStyles.presets.ts`.

/** Linha `inline`: uma coluna em contêiner estreito; título, metadados e ações lado a lado a partir de 640 px do contêiner. */
export const INLINE_COLUMNS_CLASS = 'grid-cols-1 @min-[640px]:grid-cols-[minmax(0,1fr)_auto_auto] @min-[640px]:items-center';
