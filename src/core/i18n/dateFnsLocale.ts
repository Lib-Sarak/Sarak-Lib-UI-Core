import { de } from 'date-fns/locale/de';
import { enUS } from 'date-fns/locale/en-US';
import { es } from 'date-fns/locale/es';
import { fr } from 'date-fns/locale/fr';
import { it } from 'date-fns/locale/it';
import { ptBR } from 'date-fns/locale/pt-BR';
import { primaryLanguage } from './resolveLanguage';

type Locale = object;

const DATE_FNS_LOCALES: Readonly<Record<string, Locale>> = { pt: ptBR, en: enUS, es, fr, de, it };

/** Locale do `date-fns` dos seis idiomas da lib (importados um a um); fora deles, português — como os textos (R34). */
export const resolveDateFnsLocale = (language: string): Locale => DATE_FNS_LOCALES[primaryLanguage(language)] ?? ptBR;
