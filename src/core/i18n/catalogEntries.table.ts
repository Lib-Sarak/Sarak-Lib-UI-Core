import type { SarakLibraryLanguage } from './catalog.types';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/** Textos da lib para tabela; cada plan da rc.4 acrescenta aqui os seus. */
export const CATALOG_TABLE = {} satisfies Record<string, LibraryTextEntry>;
