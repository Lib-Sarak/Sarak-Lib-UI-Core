import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos da lib para gráficos e indicadores; cada plan da rc.4 acrescenta aqui os seus. */
export const CATALOG_CHARTS = {
    statsTargetLabel: {
        pt: 'Meta', en: 'Target', es: 'Meta',
        fr: 'Objectif', de: 'Ziel', it: 'Obiettivo',
    },
} satisfies Record<string, LibraryTextEntry>;
