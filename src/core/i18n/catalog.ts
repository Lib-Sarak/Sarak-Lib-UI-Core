import { CATALOG_PART_1 } from './catalogEntries.part1';
import { CATALOG_PART_2 } from './catalogEntries.part2';
import { CATALOG_PART_3 } from './catalogEntries.part3';

export type { SarakLibraryLanguage } from './catalog.types';
import type { SarakLibraryLanguage } from './catalog.types';

/** Sem Provider, ou com um idioma fora dos seis, o texto sai neste — a base da lib (specs/10 §3.6). */
export const LIBRARY_TEXT_FALLBACK_LANGUAGE: SarakLibraryLanguage = 'pt';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/**
 * Catálogo dos textos que a PRÓPRIA lib mostra ao usuário final — cromo, widgets,
 * palette de busca e rótulos padrão de átomo. Texto que o consumidor passa
 * por prop não entra aqui: o dele vence sempre (specs/10 §3.6). O painel de Design
 * (`src/features/DesignEngine/**`) também não — segue em português, é ferramenta do
 * administrador.
 *
 * Chaves com `{nome}` aceitam interpolação via `useLibraryText()`. O conteúdo mora
 * em três companions (`catalogEntries.part{1,2,3}.ts`) por causa do teto de 250
 * linhas do Clean Code — ver o cabeçalho de `catalogEntries.part1.ts`.
 */
export const LIBRARY_TEXT_CATALOG = {
    ...CATALOG_PART_1,
    ...CATALOG_PART_2,
    ...CATALOG_PART_3,
} satisfies Record<string, LibraryTextEntry>;

export type LibraryTextKey = keyof typeof LIBRARY_TEXT_CATALOG;
