import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos da lib para layout e cromo; cada plan da rc.4 acrescenta aqui os seus. */
export const CATALOG_LAYOUT = {} satisfies Record<string, LibraryTextEntry>;
