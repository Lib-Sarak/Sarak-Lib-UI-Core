import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos de feedback e de seletores simples de filtro. */
export const CATALOG_FEEDBACK = {
    filterSelectAll: {
        pt: 'Todos', en: 'All', es: 'Todos',
        fr: 'Tous', de: 'Alle', it: 'Tutti',
    },
} satisfies Record<string, LibraryTextEntry>;
