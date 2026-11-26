import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import type { SarakLibraryLanguage } from '../../../../core/i18n/catalog';
import { DECISION_TOKEN_IDS } from '../../../../core/i18n/catalogEntries.decisionTokens';
import { enhanceToken } from '../components/DecisionTokenList';
import { isGeneralSchema, type SearchableToken } from '../../utils/token-index';

type CatalogNames = ReadonlyMap<string, { name?: string; description?: string }>;
const MAIN_TOKEN_IDS: ReadonlySet<string> = new Set(DECISION_TOKEN_IDS);

/** O que a busca indexa de um ajuste principal no idioma do painel: o nome e as opções que a tela mostra (o português segue indexado). */
const withLocalizedTexts = (token: SearchableToken, language: SarakLibraryLanguage, catalogMap: CatalogNames): SearchableToken => {
    if (language === 'pt' || !MAIN_TOKEN_IDS.has(token.id)) return token;
    const shown = enhanceToken(token, catalogMap, language);
    const options = shown.constraints?.options ?? shown.options ?? [];
    return { ...token, localizedLabel: shown.label, localizedOptions: options.map((option) => option.label).filter(Boolean) };
};

/** Todos os tokens do schema, prontos para a busca no idioma do painel. */
export const buildSearchableTokens = (language: SarakLibraryLanguage, catalogMap: CatalogNames): SearchableToken[] =>
    MASTER_DESIGN_MAP.components.flatMap((component) =>
        component.tokens.map((token) => withLocalizedTexts({ ...token, componentLabel: component.label, general: isGeneralSchema(component.id) }, language, catalogMap)));
