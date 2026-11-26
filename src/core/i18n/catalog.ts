import { CATALOG_PART_1 } from './catalogEntries.part1';
import { CATALOG_PART_2 } from './catalogEntries.part2';
import { CATALOG_PART_3 } from './catalogEntries.part3';
import { CATALOG_PART_4 } from './catalogEntries.part4';
import { CATALOG_PART_5 } from './catalogEntries.part5';
import { CATALOG_PART_6 } from './catalogEntries.part6';
import { CATALOG_TABLE } from './catalogEntries.table';
import { CATALOG_CHARTS } from './catalogEntries.charts';
import { CATALOG_LAYOUT } from './catalogEntries.layout';
import { CATALOG_FORMS } from './catalogEntries.forms';
import { CATALOG_FEEDBACK } from './catalogEntries.feedback';
import { CATALOG_ENTRIES } from './catalogEntries.entries';
import { CATALOG_PALETTE } from './catalogEntries.palette';
import { CATALOG_PALETTE_SAVED } from './catalogEntries.paletteSaved';
import { CATALOG_PANEL } from './catalogEntries.panel';
import { CATALOG_PANEL_COLUMN } from './catalogEntries.panelColumn';
import { CATALOG_PANEL_SUMMARY } from './catalogEntries.panelSummary';
import { CATALOG_SYSTEM } from './catalogEntries.system';
import { CATALOG_ACCESS } from './catalogEntries.access';
import { CATALOG_ADVANCED } from './catalogEntries.advanced';
import { CATALOG_TOKEN_NOTES } from './catalogEntries.tokenNotes';
import { CATALOG_DECISION_TOKENS } from './catalogEntries.decisionTokens';
import { CATALOG_DECISION_OPTIONS } from './catalogEntries.decisionOptions';
import { CATALOG_PANEL_LITERALS } from './catalogEntries.panelLiterals';
import { CATALOG_KEYBOARD } from './catalogEntries.keyboard';
import { CATALOG_VISIBLE_TEXTS } from './catalogEntries.visibleTexts';

export type { SarakLibraryLanguage } from './catalog.types';
import type { SarakLibraryLanguage } from './catalog.types';

/** Sem Provider, ou com um idioma fora dos seis, o texto sai neste — a base da lib (specs/10 §3.6). */
export const LIBRARY_TEXT_FALLBACK_LANGUAGE: SarakLibraryLanguage = 'pt';

type LibraryTextEntry = Record<SarakLibraryLanguage, string>;

/**
 * Catálogo dos textos que a PRÓPRIA lib mostra ao usuário final — cromo, widgets,
 * palette de busca e rótulos padrão de átomo. Texto que o consumidor passa
 * por prop não entra aqui: o dele vence sempre (specs/10 §3.6). O painel de Design
 * (`src/features/DesignEngine/**`) é ferramenta do administrador; os rótulos novos
 * da gestão de temas usam este catálogo, e o restante permanece em português.
 *
 * Chaves com `{nome}` aceitam interpolação via `useLibraryText()`. O conteúdo mora
 * em companions `catalogEntries.part*.ts` por causa do teto de 250
 * linhas do Clean Code — ver o cabeçalho de `catalogEntries.part1.ts`.
 */
export const LIBRARY_TEXT_CATALOG = {
    ...CATALOG_PART_1,
    ...CATALOG_PART_2,
    ...CATALOG_PART_3,
    ...CATALOG_PART_4,
    ...CATALOG_PART_5,
    ...CATALOG_PART_6,
    ...CATALOG_TABLE,
    ...CATALOG_CHARTS,
    ...CATALOG_LAYOUT,
    ...CATALOG_FORMS,
    ...CATALOG_FEEDBACK,
    ...CATALOG_ENTRIES,
    ...CATALOG_PALETTE,
    ...CATALOG_PALETTE_SAVED,
    ...CATALOG_PANEL,
    ...CATALOG_PANEL_COLUMN,
    ...CATALOG_PANEL_SUMMARY,
    ...CATALOG_SYSTEM,
    ...CATALOG_ACCESS,
    ...CATALOG_ADVANCED,
    ...CATALOG_TOKEN_NOTES,
    ...CATALOG_DECISION_TOKENS,
    ...CATALOG_DECISION_OPTIONS,
    ...CATALOG_PANEL_LITERALS,
    ...CATALOG_KEYBOARD,
    ...CATALOG_VISIBLE_TEXTS,
} satisfies Record<string, LibraryTextEntry>;

export type LibraryTextKey = keyof typeof LIBRARY_TEXT_CATALOG;
