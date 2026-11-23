import React from 'react';
import { DecisionTokenRow } from './DecisionTokenRow';
import { useLibraryLanguage, useLibraryText } from '../../../../core/i18n/useLibraryText';
import { LIBRARY_TEXT_CATALOG, type LibraryTextKey, type SarakLibraryLanguage } from '../../../../core/i18n/catalog';
import { DECISION_TOKEN_IDS, decisionTokenTextKey } from '../../../../core/i18n/catalogEntries.decisionTokens';
import { decisionOptionTextKey } from '../../../../core/i18n/catalogEntries.decisionOptions';
import type { SarakDesignState } from '../../../../core/Provider/types';
import type { SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';

type CatalogNames = ReadonlyMap<string, { name?: string; description?: string }>;

/** O que todo bloco de controles da coluna precisa para desenhar e gravar um token. */
export interface ColumnTokenProps {
    catalogMap: CatalogNames;
    draft: SarakDesignState;
    updateDraft: (id: string, value: SarakTokenValue) => void;
    previewDevice: string;
}

type TokenOption = string | { label?: string; name?: string };
const MAIN_DECISION_TOKEN_IDS: ReadonlySet<string> = new Set(DECISION_TOKEN_IDS);

/** Só o rótulo mostrado muda (`id`, `value` e ordem ficam); opção sem texto no idioma, nome de fonte e número seguem como o schema os guarda. */
const translateOptions = (options: readonly TokenOption[] | undefined, language: SarakLibraryLanguage): TokenOption[] | undefined =>
    options?.map((option) => {
        if (typeof option !== 'object') return option;
        const shown = option.label ?? option.name;
        const translated = shown === undefined ? undefined : LIBRARY_TEXT_CATALOG[decisionOptionTextKey(shown) as LibraryTextKey]?.[language];
        if (!translated) return option;
        return { ...option, ...(option.label !== undefined ? { label: translated } : { name: translated }) };
    });

/** Troca os rótulos das opções do seletor no idioma do painel, só nos tokens das decisões principais (o ajuste fino segue em português). */
const withTranslatedOptions = (token: SarakDesignToken, language: SarakLibraryLanguage): SarakDesignToken => {
    if (language === 'pt' || !MAIN_DECISION_TOKEN_IDS.has(token.id)) return token;
    const nested = translateOptions(token.constraints?.options as TokenOption[] | undefined, language);
    const flat = translateOptions(token.options as TokenOption[] | undefined, language);
    return {
        ...token,
        ...(token.constraints && nested ? { constraints: { ...token.constraints, options: nested } } : {}),
        ...(flat ? { options: flat } : {}),
    } as SarakDesignToken;
};

/** O rótulo e a descrição do catálogo vencem os do schema (a tela mostra um, o schema guarda o outro). */
export const enhanceToken = (token: SarakDesignToken, catalogMap: CatalogNames, language: SarakLibraryLanguage = 'pt'): SarakDesignToken => {
    const metadata = catalogMap.get(token.id);
    const nameKey = decisionTokenTextKey(token.id, 'name') as LibraryTextKey;
    const descriptionKey = decisionTokenTextKey(token.id, 'description') as LibraryTextKey;
    const name = LIBRARY_TEXT_CATALOG[nameKey]?.[language];
    const description = LIBRARY_TEXT_CATALOG[descriptionKey]?.[language];
    return {
        ...withTranslatedOptions(token, language),
        label: (language === 'pt' ? metadata?.name : name) || metadata?.name || token.label,
        description: (language === 'pt' ? metadata?.description : description) || metadata?.description || token.description,
    };
};

interface DecisionTokenListProps extends ColumnTokenProps {
    tokens: readonly SarakDesignToken[];
}

/** Uma pilha de controles de token. Cada linha leva o id do token: é por ele que a busca acha o controle e o põe à vista. */
export const DecisionTokenList: React.FC<DecisionTokenListProps> = ({ tokens, catalogMap, draft, updateDraft, previewDevice }) => {
    const language = useLibraryLanguage();
    const draftRecord = draft as Record<string, SarakTokenValue>;
    return (
        <div className="flex flex-col gap-4">
            {tokens.map((token) => (
                <DecisionTokenRow key={token.id} token={enhanceToken(token, catalogMap, language)} draft={draftRecord} updateDraft={updateDraft} previewDevice={previewDevice} />
            ))}
        </div>
    );
};

interface DecisionSectionListProps extends ColumnTokenProps {
    sections: readonly { title: string; titleKey?: LibraryTextKey; tokens: readonly SarakDesignToken[] }[];
}

/** Seções com título e os controles delas: o ajuste fino e a composição da barra. */
export const DecisionSectionList: React.FC<DecisionSectionListProps> = ({ sections, ...tokenProps }) => {
    const text = useLibraryText();
    return (
        <div className="flex flex-col gap-5">
            {sections.map((section) => {
                const title = section.titleKey ? text(section.titleKey) : section.title;
                return (
                    <section key={section.title} aria-label={title} data-decision-section={section.title} className="flex flex-col gap-3">
                        <h4 className="text-xs font-semibold text-[var(--theme-muted)]">{title}</h4>
                        <DecisionTokenList tokens={section.tokens} {...tokenProps} />
                    </section>
                );
            })}
        </div>
    );
};
