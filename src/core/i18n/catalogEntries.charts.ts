import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos da lib para gráficos e indicadores; cada plan da rc.4 acrescenta aqui os seus. */
export const CATALOG_CHARTS = {} satisfies Record<string, LibraryTextEntry>;
