import React from 'react';
import { TokenControl } from './TokenControl';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';
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

/** O rótulo e a descrição do catálogo vencem os do schema (a tela mostra um, o schema guarda o outro). */
export const enhanceToken = (token: SarakDesignToken, catalogMap: CatalogNames): SarakDesignToken => {
    const metadata = catalogMap.get(token.id);
    return { ...token, label: metadata?.name || token.label, description: metadata?.description || token.description };
};

interface DecisionTokenListProps extends ColumnTokenProps {
    tokens: readonly SarakDesignToken[];
}

/** Uma pilha de controles de token. Cada linha leva o id do token: é por ele que a busca acha o controle e o põe à vista. */
export const DecisionTokenList: React.FC<DecisionTokenListProps> = ({ tokens, catalogMap, draft, updateDraft, previewDevice }) => {
    const draftRecord = draft as Record<string, SarakTokenValue>;
    return (
        <div className="flex flex-col gap-4">
            {tokens.map((token) => {
                const enhanced = enhanceToken(token, catalogMap);
                return (
                    <div key={enhanced.id} data-token-row={enhanced.id} tabIndex={-1} className="rounded-[var(--sarak-card-radius,10px)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]">
                        <TokenControl
                            token={enhanced}
                            value={draftRecord[enhanced.id]}
                            onChange={(value) => updateDraft(enhanced.id, value)}
                            previewDevice={previewDevice}
                            draft={draftRecord}
                            updateDraft={updateDraft}
                        />
                    </div>
                );
            })}
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
