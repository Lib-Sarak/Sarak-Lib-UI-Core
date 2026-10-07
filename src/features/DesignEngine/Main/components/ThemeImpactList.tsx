import React from 'react';
import { TokenControl } from './TokenControl';
import type { SarakDesignState } from '../../../../core/Provider/types';
import type { SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';
import type { VisualImpactToken } from '../hooks/useThemeCustomizationData';

interface ThemeImpactListProps {
    tokens: VisualImpactToken[];
    catalogMap: Map<string, { name?: string; description?: string }>;
    draft: SarakDesignState;
    updateDraft: (id: string, value: SarakTokenValue) => void;
    previewDevice: string;
}

const IMPACT_GROUPS = [
    { id: 'fontes', title: 'Fontes' },
    { id: 'cores', title: 'Cores' },
    { id: 'fundo', title: 'Fundo e textura' },
    { id: 'cards', title: 'Cards' },
    { id: 'forma', title: 'Forma e estrutura' }
] as const;

const TOKEN_DISPLAY_ORDER = [
    'headingFont', 'bodyFont', 'bodySize', 'h1Size',
    'primaryColor', 'secondaryColor', 'mode', 'textColorMaster',
    'texture', 'surfaceMaterial', 'systemTone',
    'cardVariant', 'cardTextureType', 'cardBorderRadius', 'cardBackgroundColor', 'shadowIntensity', 'borderType',
    'btnBorderRadius', 'btnStyleType', 'navigationStyle'
];

const TOKEN_DISPLAY_ORDER_INDEX = new Map(TOKEN_DISPLAY_ORDER.map((tokenId, index) => [tokenId, index]));

const sortGroupTokens = (tokens: VisualImpactToken[]): VisualImpactToken[] => [...tokens].sort((left, right) => {
    const leftIndex = TOKEN_DISPLAY_ORDER_INDEX.get(left.token.id) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = TOKEN_DISPLAY_ORDER_INDEX.get(right.token.id) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
});

const enhanceToken = (
    token: SarakDesignToken,
    catalogMap: ThemeImpactListProps['catalogMap']
): SarakDesignToken => {
    const metadata = catalogMap.get(token.id);
    return {
        ...token,
        label: metadata?.name || token.label,
        description: metadata?.description || token.description
    };
};

const ImpactTokenControl: React.FC<{
    item: VisualImpactToken;
    catalogMap: ThemeImpactListProps['catalogMap'];
    draftRecord: Record<string, SarakTokenValue>;
    updateDraft: ThemeImpactListProps['updateDraft'];
    previewDevice: string;
}> = ({ item, catalogMap, draftRecord, updateDraft, previewDevice }) => {
    const token = enhanceToken(item.token, catalogMap);
    return (
        <div key={token.id} data-visual-impact-token={token.id}>
            <TokenControl
                token={token}
                value={draftRecord[token.id]}
                onChange={(value) => updateDraft(token.id, value)}
                previewDevice={previewDevice}
            />
        </div>
    );
};

const ImpactGroup: React.FC<{
    group: (typeof IMPACT_GROUPS)[number];
    tokens: VisualImpactToken[];
    catalogMap: ThemeImpactListProps['catalogMap'];
    draftRecord: Record<string, SarakTokenValue>;
    updateDraft: ThemeImpactListProps['updateDraft'];
    previewDevice: string;
}> = ({ group, tokens, catalogMap, draftRecord, updateDraft, previewDevice }) => {
    const groupTokens = sortGroupTokens(tokens.filter((item) => item.group === group.id));
    if (groupTokens.length === 0) return null;

    return (
        <section aria-labelledby={`theme-impact-${group.id}`} data-visual-impact-group={group.id}>
            <h3 id={`theme-impact-${group.id}`} className="mb-3 text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest text-[var(--theme-muted)]">
                {group.title}
            </h3>
            <div className="flex flex-col gap-4">
                {groupTokens.map((item) => (
                    <ImpactTokenControl
                        key={item.token.id}
                        item={item}
                        catalogMap={catalogMap}
                        draftRecord={draftRecord}
                        updateDraft={updateDraft}
                        previewDevice={previewDevice}
                    />
                ))}
            </div>
        </section>
    );
};

export const ThemeImpactList: React.FC<ThemeImpactListProps> = (props) => {
    const draftRecord = props.draft as Record<string, SarakTokenValue>;

    return (
        <div className="flex flex-col gap-6 px-2 py-4">
            {IMPACT_GROUPS.map((group) => (
                <ImpactGroup
                    key={group.id}
                    group={group}
                    tokens={props.tokens}
                    catalogMap={props.catalogMap}
                    draftRecord={draftRecord}
                    updateDraft={props.updateDraft}
                    previewDevice={props.previewDevice}
                />
            ))}
        </div>
    );
};
